import { useContext } from 'react';
import { EditorContext } from '../contexts/Editor.context';

// Method 1: Default export
export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export default useEditorContext;