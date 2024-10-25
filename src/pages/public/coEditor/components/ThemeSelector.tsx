import { Moon, Sun } from "lucide-react";

interface ThemeSelectorInterface {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  size?: 'sm' | 'default';
}
const ThemeSelector: React.FC<ThemeSelectorInterface> = ({ onThemeChange, theme }) => {

  return <button
  onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
className="p-2 rounded-md  text-secondary-foreground hover:bg-secondary/80 transition-colors"
aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
>
{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
</button>
};

export default ThemeSelector;
