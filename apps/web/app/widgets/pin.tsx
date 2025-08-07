import React, { useState, useRef, KeyboardEvent, useEffect } from "react";

const PinInput = ({ setPin }: { setPin: (pin: string) => void }) => {
  const [pin, setLocalPin] = useState(["", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Call the parent's setPin callback whenever pin changes
  useEffect(() => {
    const fullPin = pin.join("");
    setPin(fullPin.length === 4 ? fullPin : "");
  }, [pin, setPin]);

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, "");

    // Create a copy of the current pin state
    const newPin = [...pin];

    // Update the specific index
    newPin[index] = numericValue;

    // Update state
    setLocalPin(newPin);

    // Auto-focus to next input if a digit is entered
    if (numericValue && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center space-x-4">
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-8 h-8 p-0 inset-0 text-center text-xs 
              border-1 border-gray-300 rounded-lg 
              focus:border-blue-500 focus:outline-none 
              transition-colors duration-200"
            pattern="\d*"
            inputMode="numeric"
          />
        ))}
      </div>
    </div>
  );
};

export default PinInput;
