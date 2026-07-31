import { useTheme } from "../hooks/useTheme";
import "./ThemeToggle.css";

export const ThemeToggle = () => {
  const { mode, toggle } = useTheme();

  return (
    <label htmlFor="theme" className="theme" title={mode === "dark" ? "Dark mode" : "Light mode"}>
      <span className="theme__toggle-wrap">
        <input
          id="theme"
          className="theme__toggle"
          type="checkbox"
          role="switch"
          name="theme"
          checked={mode === "dark"}
          onChange={toggle}
          aria-label="Toggle dark mode"
        />
        <span className="theme__icon">
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
          <span className="theme__icon-part" />
        </span>
      </span>
    </label>
  );
};
