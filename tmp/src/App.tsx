/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Login from './components/Login';
import Lobby from './components/Lobby';
import GameCanvas from './components/GameCanvas';

export default function App() {
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('blox_username');
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLogin = (name: string) => {
    localStorage.setItem('blox_username', name);
    setUsername(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('blox_username');
    setUsername(null);
    setIsPlaying(false);
  };

  const quitGame = () => {
    setIsPlaying(false);
  }

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  if (!isPlaying) {
    return <Lobby username={username} onPlay={() => setIsPlaying(true)} onLogout={handleLogout} />;
  }

  return <GameCanvas username={username} onLogout={quitGame} />;
}


