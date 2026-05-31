/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Lobby from './components/Lobby';
import GameCanvas from './components/GameCanvas';

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('blox_last_loggedin');
    if (saved) {
      setUsername(saved);
    }
  }, []);

  const handleLogout = () => {
    setUsername(null);
    setIsPlaying(false);
    localStorage.removeItem('blox_last_loggedin');
  };

  const handleLogin = (user: string) => {
    localStorage.setItem('blox_last_loggedin', user);
    setUsername(user);
  };

  return (
    <>
      {!username ? (
        <Login onLogin={handleLogin} />
      ) : !isPlaying ? (
        <Lobby username={username} onPlay={() => setIsPlaying(true)} onLogout={handleLogout} />
      ) : (
        <GameCanvas username={username} onLogout={handleLogout} />
      )}
    </>
  );
}
