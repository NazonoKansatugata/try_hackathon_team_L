import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className={`dark-mode-toggle ${className}`}
      style={{
        padding: '0.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '1.2rem',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '40px',
        minHeight: '40px',
      }}
      title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};

export default DarkModeToggle;
