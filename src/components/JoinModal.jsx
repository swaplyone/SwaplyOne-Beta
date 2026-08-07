import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      onClose();
      navigate('/login');
    }
  }, [isOpen, navigate, onClose]);

  return null;
}
