// src/App.tsx
import { useToast } from "@/hooks/use-toast";
import { cn, getFileExtension, local } from "@/lib/utils";
import debounce from 'lodash/debounce';
import { DownloadIcon, GripHorizontal, GripVertical, Loader2, Play, SaveIcon, TrashIcon } from "lucide-react";
import * as monaco from "monaco-editor";
import React, { useCallback, useEffect, useState } from "react";
import MonacoEditor from "./components/Editor";
import { CurrentUserInterface, SessionDataInterface } from "./components/Editor.types";
import EditorControl from "./components/EditorControl";

import EditorSidebar from "./components/EditorSidebar";
import LanguageSelector from "./components/LanguageSelector";

import useEditorContext from "./hooks/useEditor.contexthook";
import { useEditorOutlet } from './hooks/useEditor.outlet';

const DragHandle: React.FC<{ position: 'side' | 'bottom' }> = ({ position }) => {
  const Icon = position === 'side' ? GripVertical : GripHorizontal;

  return (
    <div className={cn(
      "absolute flex items-center justify-center",
      "hover:bg-slate-500/50 rounded transition-colors",
      position === 'side'
        ? '-left-1 top-1/2 -translate-y-1/2 h-20 w-3'
        : 'top-[-6px] left-1/2 -translate-x-1/2 w-20 h-3'
    )}>
      <Icon
        className={cn(
          "text-slate-400 hover:text-slate-200 transition-colors",
          position === 'side' ? 'w-3 h-10' : 'w-10 h-3'
        )}
      />
    </div>
  );
};

const RealTimeEditor: React.FC = () => {

  const { sessionId, theme } = useEditorOutlet();

  const { sessionData , setSessionData } = useEditorContext();
  const [editorContent, setEditorContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [isEditorEmpty, setIsEditorEmpty] = useState<boolean>(true);
  const [editorContext, setEditorContext] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  // const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({ line: 0, column: 0 });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [defaultContent, setDefaultContent] = useState<string | undefined>();
  const [hasCodeBeenPrinted, setHasCodeBeenPrinted] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    // Example of using context
    console.log('Current theme:', theme);
    console.log('Session data:', sessionData);
  }, [theme, sessionData]);



  const getSessionData = useCallback((): SessionDataInterface => {

    return local("json", sessionId).get(`sessionIdentifier`) || {};

  }, [sessionId]);


  const [chatWidth, setChatWidth] = useState<number>(() => {
    const sessionData = local("json", sessionId).get(`sessionIdentifier`);
    return sessionData?.chatWidth ?? 30;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [chatPosition, setChatPosition] = useState<'side' | 'bottom'>(() => {
    const sessionData = local("json", sessionId).get(`sessionIdentifier`);
    return sessionData?.chatPosition ?? 'side';
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.getElementById('editor-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    let newWidth;

    if (chatPosition === 'side') {
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      newWidth = ((containerWidth - mouseX) / containerWidth) * 100;
    } else {
      const containerHeight = containerRect.height;
      const mouseY = e.clientY - containerRect.top;
      newWidth = ((containerHeight - mouseY) / containerHeight) * 100;
    }

    const clampedWidth = Math.min(Math.max(newWidth, 15), 85);
    setChatWidth(clampedWidth);

    const sessionData = getSessionData();
    setSessionData({
      ...sessionData,
      chatWidth: clampedWidth
    });
  }, [isDragging, chatPosition, getSessionData, setSessionData]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = chatPosition === 'side' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };
  }, [isDragging, chatPosition, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const sessionData = getSessionData();
    if (sessionData?.editor?.content) {
      setEditorContent(sessionData.editor.content);
      setDefaultContent(sessionData.editor.content);
    }
    setLanguage(sessionData?.editor?.language || "javascript");

  }, [sessionId, getSessionData]);




  useEffect(() => {
    const sessionData = getSessionData();
    if (sessionData?.chatWidth) {
      setChatWidth(sessionData.chatWidth);
    }
  }, [sessionId, getSessionData]);

  const handleContentChange = useCallback((content: string) => {
    const sessionData = getSessionData();
    setSessionData({
      ...sessionData,
      guestIdentifier: {
        ...sessionData.guestIdentifier,
        cursorPosition: { line: 0, column: 0 }
      } as CurrentUserInterface,
      editor: {
        ...sessionData.editor,
        content: content
      }
    });
    setEditorContent(content);
    setIsEditorEmpty(content === "");
    debouncedSave(content);
  }, []);

  const handleEditorMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    setEditorContext(editor);
    setIsEditorEmpty(editor?.getValue() === "");

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveToLocalStorage(editor.getValue());
    });

    // editor.onDidChangeCursorPosition((e) => {
    //   setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
    // });
  }, []);

  const handleClearContent = useCallback(() => {
    if (editorContext) {
      editorContext.setValue("");
      setEditorContent("");
      setIsEditorEmpty(true);
      const sessionData = getSessionData();
      setSessionData({ ...sessionData, editor: { ...sessionData.editor, content: "" } });
    }
  }, [editorContext, getSessionData, setSessionData]);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    const sessionData = getSessionData();
    setSessionData({ ...sessionData, editor: { ...sessionData.editor, language: lang } });
  }, [getSessionData, setSessionData]);




  const downloadContent = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob([editorContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded",
      description: "Your code has been downloaded",
    });
  }, [editorContent, language, toast]);

  const saveToLocalStorage = useCallback((content: string) => {
    setIsSaving(true);
    const sessionData = getSessionData();
    setSessionData({
      ...sessionData,
      editor: {
        ...sessionData.editor,
        content: content
      }
    });
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  }, [getSessionData, setSessionData]);

  const debouncedSave = useCallback(
    debounce((content: string) => saveToLocalStorage(content), 2000),
    [saveToLocalStorage]
  );

  const handleRunCodeWithInDevTools = useCallback(() => {
    if (editorContext) {
      const code = editorContext.getValue();

      if (!hasCodeBeenPrinted) {
        console.log('%c Execute code from editor:', 'color: #00ff00; font-weight: bold;');
        setHasCodeBeenPrinted(true);
      }

      toast({
        variant: "info",
        title: "Running code",
        description: "Open your browser console to see the output",
      });

      try {
        if (code) {
          const result = eval(code);
          if (result === undefined) {
            console.log(undefined);
          }
        } else {
          console.log('%c No code to execute:', 'color: #ff0000; font-weight: bold;');
        }
      } catch (error) {
        console.error('Error executing code:', error);
      }
    }
  }, [editorContext, hasCodeBeenPrinted, toast]);

  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const toggleChatPosition = useCallback(() => {
    const newPosition = chatPosition === 'side' ? 'bottom' : 'side';
    setChatPosition(newPosition);
    const sessionData = getSessionData();
    setSessionData({
      ...sessionData,
      chatPosition: newPosition
    });
  }, [chatPosition, getSessionData, setSessionData]);

  return (
    <div className="flex flex-col h-screen">

      <main
        id="editor-container"
        className={cn(
          "flex flex-1 overflow-hidden relative",
          chatPosition === 'bottom' && "flex-col"
        )}
      >
        <div
          className="flex flex-col"
          style={{
            width: chatPosition === 'side' ? `${100 - chatWidth}%` : '100%',
            height: chatPosition === 'bottom' ? `${100 - chatWidth}%` : '100%'
          }}
        >
          <div className="editor-header flex flex-row justify-end p-1 border-b border-border text-xs">
            <div className="h-full w-px bg-border mx-2"></div>
            {language === "javascript" && (
              <>
                <EditorControl
                  isEditorEmpty={isEditorEmpty}
                  label="Run"
                  icon={<Play className="w-4 h-4" />}
                  onClick={handleRunCodeWithInDevTools}
                />
                <div className="h-full w-px bg-border mx-2"></div>
              </>
            )}
            <EditorControl
              isEditorEmpty={isEditorEmpty}
              label="Clear"
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleClearContent}
            />
            <div className="h-full w-px bg-border mx-2"></div>
            <EditorControl
              isEditorEmpty={isEditorEmpty}
              label={isSaving ? "Saving..." : "Save"}
              icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
              onClick={() => saveToLocalStorage(editorContent)}
            />
            <div className="h-full w-px bg-border mx-2"></div>
            <EditorControl
              isEditorEmpty={isEditorEmpty}
              label="Download"
              icon={<DownloadIcon className="w-4 h-4" />}
              onClick={downloadContent}
            />
            <div className="h-full w-px bg-border mx-2"></div>
            <div className="flex flex-row items-center min-w-36 justify-center">
              <LanguageSelector onSelectLanguage={handleLanguageChange} preSelectedLanguage={language} />
            </div>
          </div>
          <MonacoEditor
            className="editor-content flex-1"
            language={language}
            onContentChange={handleContentChange}
            defaultValue={defaultContent}
            theme={theme}
            height="100%"
            onEditorMount={handleEditorMount}
          />
        </div>

        <div
          className={cn(
            'relative z-20',
            'transition-colors duration-200',
            chatPosition === 'side' ? 'w-1.5 hover:w-3' : 'h-1.5 hover:h-3',
            isDragging && 'bg-slate-500',
            chatPosition === 'side'
              ? 'border-x border-slate-600'
              : 'border-y border-slate-600',
            'bg-slate-700'
          )}
          onMouseDown={handleSplitterMouseDown}
        >
          <DragHandle position={chatPosition} />
        </div>

        <div
          className={cn(
            "bg-background-light flex flex-col",
            chatPosition === 'side' ? 'border-l' : 'border-t',
            'border-slate-300'
          )}
          style={{
            width: chatPosition === 'side' ? `${chatWidth}%` : '100%',
            height: chatPosition === 'bottom' ? `${chatWidth}%` : '100%'
          }}
        >
          <div className="flex items-center justify-end p-1 border-b border-border">
            <button
              onClick={toggleChatPosition}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {chatPosition === 'side' ? '⬇️' : '➡️'}
            </button>
          </div>
          <EditorSidebar />
        </div>

        {isDragging && (
          <div className="absolute inset-0 z-50" />
        )}
      </main>

    </div>
  );
};

export default RealTimeEditor;


