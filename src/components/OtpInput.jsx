import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function OtpInput({ length = 6, onComplete, disabled = false }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take last entered character
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Trigger complete callback if full
    const combined = newOtp.join('');
    if (combined.length === length && !newOtp.includes('')) {
      if (onComplete) onComplete(combined);
    } else if (value && index < length - 1) {
      // Focus next
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split('');
    const newOtp = Array(length).fill('');
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    if (newOtp.join('').length === length) {
      if (onComplete) onComplete(newOtp.join(''));
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1].focus();
      }
    } else {
      const nextEmpty = newOtp.findIndex(val => !val);
      if (nextEmpty !== -1 && inputRefs.current[nextEmpty]) {
        inputRefs.current[nextEmpty].focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-4">
      {otp.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          whileFocus={{ scale: 1.06 }}
          className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black text-swaply-black bg-paper-card border-3 border-swaply-black rounded-xl shadow-hard focus:outline-none focus:bg-swaply-yellow/30 focus:border-swaply-coral transition-all ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      ))}
    </div>
  );
}
