// src/components/LanguageSelector.tsx
import React from "react";

interface LanguageSelectorProps {
  onSelectLanguage: (language: string) => void;
  preSelectedLanguage: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage, preSelectedLanguage }) => {
  const languages = ["javascript", "python", "html", "css", "typescript"];

  return (
    <select
      onChange={(e) => onSelectLanguage(e.target.value)}
      className="p-1 rounded bg-background text-foreground hover:bg-background/80 transition-colors border-border
      text-xs"
      value={preSelectedLanguage}
    >
      {languages.map((lang, index) => (
          <option key={index} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
