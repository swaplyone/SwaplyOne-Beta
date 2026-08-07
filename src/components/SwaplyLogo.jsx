import React from 'react';

export default function SwaplyLogo({ size = 22, color = "#D85B3E" }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        background: color,
        border: '1.5px solid #1B2233',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontSize: `${size * 0.5}px`,
        color: '#FFF',
        boxShadow: '1.5px 1.5px 0px #1B2233 flex-shrink-0'
      }}
    >
      S
    </div>
  );
}
