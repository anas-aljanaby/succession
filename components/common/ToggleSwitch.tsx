import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled = false }) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  return (
    <button
      type="button"
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800
        ${enabled ? 'bg-primary-600' : 'bg-gray-600'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      role="switch"
      aria-checked={enabled}
      onClick={handleToggle}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
          transition duration-200 ease-in-out
          ${enabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};
