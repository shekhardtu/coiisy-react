
import React from "react";

interface EditorControlProps {
  isEditorEmpty: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const EditorControl = ({
  isEditorEmpty,
  label,
  icon,
  onClick,
}: EditorControlProps) => {
  return (
    <div
      className={`flex flex-row items-center  min-w-24 justify-center cursor-pointer hover:text-primary transition-colors duration-200 ${
    isEditorEmpty
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "opacity-100"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-1">{label}</span>
    </div>
  );
};

export default EditorControl;
