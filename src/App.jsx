import React from 'react';
import GameBoard from './GameBoard';
import Galaxy from './Galaxy';
import './index.css';

export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      
      {/* 1. The Galaxy Background (Sits at the very back) */}
      <div className="absolute inset-0 z-0">
        <Galaxy />
      </div>

      {/* 2. Your Game UI Wrapper */}
      {/* CRITICAL: pointer-events-none here lets your finger pass through the empty screen space */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        
        {/* This loads your actual Mafia game */}
        <GameBoard />

      </div>
    </div>
  );
}