import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Types
interface ColorChangeEvent {
  target: {
    name: string;
    value: string;
  };
}

interface CustomColorPickerProps {
  label?: string;
  value?: string;
  onChange?: (event: ColorChangeEvent) => void;
  name: string;
  id: string;
  className?: string;
  showPrefix?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Custom Color Picker Component
const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  label,
  value = '#3b82f6',
  onChange,
  name,
  id,
  className = '',
  showPrefix = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tempValue, setTempValue] = useState<string>(value);
  const [hue, setHue] = useState<number>(220);
  const [saturation, setSaturation] = useState<number>(100);
  const [lightness, setLightness] = useState<number>(50);
  const [pickerPosition, setPickerPosition] = useState<Position>({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Convert hex to HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c: number): string => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Initialize HSL values from hex
  useEffect(() => {
    if (tempValue && tempValue.length === 7) {
      const [h, s, l] = hexToHsl(tempValue);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      // Calculate position based on saturation and lightness
      setPickerPosition({
        x: s,
        y: 100 - l,
      });
    }
  }, [tempValue]);

  // Handle canvas click for color selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPickerPosition({ x, y });
    const newSaturation = x;
    const newLightness = 100 - y;
    setSaturation(newSaturation);
    setLightness(newLightness);

    const newColor = hslToHex(hue, newSaturation, newLightness);
    handleColorChange(newColor);
  };

  // Handle mouse drag for color selection
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    setIsDragging(true);
    handleCanvasClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    handleCanvasClick(e);
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  // Handle hue slider change
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    const newColor = hslToHex(newHue, saturation, lightness);
    handleColorChange(newColor);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleMouseUpGlobal = (): void => {
      setIsDragging(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, []);

  const handleColorChange = (newColor: string): void => {
    setTempValue(newColor);
    if (onChange) {
      onChange({ target: { name, value: newColor } });
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let hexValue = e.target.value;

    // Add # if not present
    if (hexValue && !hexValue.startsWith('#')) {
      hexValue = '#' + hexValue;
    }

    // Validate hex color format
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexValue) || hexValue === '#') {
      handleColorChange(hexValue);
    }
  };

  const presetColors: string[] = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#991b1b',
    '#92400e',
    '#78350f',
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Main Color Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-between rounded-md border border-gray-300 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${className}`}
          style={{ backgroundColor: tempValue }}
        >
          {/* Color Preview */}
          <div className="flex items-center space-x-2 px-2">
            <div
              className="w-6 h-6 rounded border border-white/20 shadow-sm"
              style={{ backgroundColor: tempValue }}
            />
            <span className="text-xs font-medium text-white mix-blend-difference">
              {tempValue.toUpperCase()}
            </span>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown className="w-4 h-4 text-white mix-blend-difference mr-2" />
        </button>

        {/* Hidden native input for form submission */}
        <input type="hidden" name={name} id={id} value={tempValue} />

        {/* Dropdown Panel */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-72"
          >
            {/* Full Spectrum Color Picker */}
            <div className="mb-3">
              <div className="relative">
                {/* Hue Gradient Background */}
                <div
                  className="w-full h-16 rounded-lg border border-gray-200 cursor-crosshair relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to bottom, transparent, black), 
                                linear-gradient(to right, white, transparent), 
                                linear-gradient(to right, 
                                  #ff0000 0%, #ffff00 17%, #00ff00 33%, 
                                  #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
                  }}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  ref={canvasRef}
                >
                  {/* Color Picker Dot */}
                  <div
                    className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${pickerPosition.x}%`,
                      top: `${pickerPosition.y}%`,
                      backgroundColor: tempValue,
                    }}
                  />
                </div>

                {/* Hue Slider */}
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={handleHueChange}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        #ff0000 0%, #ffff00 17%, #00ff00 33%, 
                        #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Hex Input */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Hex Color</label>
              <input
                type="text"
                value={tempValue}
                onChange={handleHexInputChange}
                placeholder="#3b82f6"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Preset Colors */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Quick Colors</label>
              <div className="grid grid-cols-10 gap-1 mb-3">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Common Colors Row */}
            <div className="flex space-x-1">
              {['#000000', '#ffffff', '#6b7280', '#ef4444', '#3b82f6'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className="flex-1 h-6 rounded border border-gray-200 hover:scale-105 transition-transform focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomColorPicker;
