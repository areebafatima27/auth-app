import React from 'react';

const Button = ({ children, onClick, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-lg shadow-lg focus:outline-none transition-all ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;