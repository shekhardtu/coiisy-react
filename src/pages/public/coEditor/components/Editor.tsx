import MonacoEditor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import React, { useCallback, useRef } from "react";
interface EditorProps {
  language: string;
  theme?: 'light' | 'dark';
  height?: string;
  onContentChange: (content: string) => void;
  onEditorMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  defaultValue?: string;
  className?: string;
}

const Editor: React.FC<EditorProps> = ({
  language,
  theme = "light",
  onContentChange,
  onEditorMount,
  defaultValue,
  height = "100%",
  className
}) => {
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    onEditorMount?.(editor);
  }, [onEditorMount]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value);
    }
  }, [onContentChange]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <MonacoEditor
        height={height}
        language={language}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        defaultValue={defaultValue}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 16,
          lineNumbers: 'on',
          selectOnLineNumbers: true,
          selectionHighlight: true,
          multiCursorModifier: 'ctrlCmd',
          renderLineHighlightOnlyWhenFocus: true,

          scrollbar: {
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          },

          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          detectIndentation: false,
          insertSpaces: true,
          wordWrap: 'on',
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'smart',
          cursorBlinking: 'blink',

          cursorSmoothCaretAnimation: 'off',
          smoothScrolling: true,
          mouseWheelZoom: false,
          bracketPairColorization: { enabled: true },
          renderWhitespace: 'selection',
          lineDecorationsWidth: 10,
          renderLineHighlight: 'none',
          // ... other existing options ...
        }}
      />
    </div>
  );
};

export default Editor;
