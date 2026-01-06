import React from 'react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  id: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange, id }) => {
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith('#')) {
       // Allow typing
       onChange(val);
    } else {
        onChange('#' + val);
    }
  };

  const handleBlur = () => {
      // Basic validation on blur to ensure 6 chars
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
          if (color.length === 4) {
              // Expand shorthand logic could go here
          }
      }
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-sm font-bold text-slate-600">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <div className="relative w-12 h-12 rounded-lg shadow-sm overflow-hidden ring-1 ring-slate-200">
            <input
                type="color"
                id={id}
                value={color.length === 7 ? color : '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 border-0 cursor-pointer"
            />
        </div>
        <div className="relative flex-1">
            <input
                type="text"
                value={color}
                onChange={handleHexChange}
                onBlur={handleBlur}
                className="w-full pl-3 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                maxLength={7}
            />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
