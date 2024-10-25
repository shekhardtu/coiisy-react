import { useOutletContext } from 'react-router-dom';

interface EditorOutletContext {
  theme: "light" | "dark";
  sessionId: string;
}

export const useEditorOutlet = () => {
  return useOutletContext<EditorOutletContext>();
};