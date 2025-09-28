
import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange }) => {
  return (
    <label className="toggle-switch">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <span className="toggle-slider"></span>
    </label>
  );
};

export default ToggleSwitch;
