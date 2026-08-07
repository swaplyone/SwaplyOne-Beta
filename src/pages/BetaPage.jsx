import React from 'react';
import { useNavigate } from 'react-router-dom';
import BetaTesterPage from '../components/BetaTesterPage';

export default function BetaPage({ onOpenJoinModal }) {
  const navigate = useNavigate();
  return (
    <BetaTesterPage
      onBackToHome={() => navigate('/')}
      onOpenJoinModal={onOpenJoinModal}
    />
  );
}
