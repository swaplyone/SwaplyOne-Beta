import React from 'react';

export default function SwaplyLogo({ size = 26, color = "#FFFFFF" }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: color,
        border: '2px solid #1B2233',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '1.5px 1.5px 0px #1B2233',
        flexShrink: 0,
        overflow: 'hidden'
      }}
    >
      <img
        src="/swaply-favicon-bgl.png"
        alt="Swaply Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '50%'
        }}
      />
    </div>
  );
}
