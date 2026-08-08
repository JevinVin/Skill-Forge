import React from 'react';
import Navbar from '../components/layout/Navbar';
import CodePlayground from '../components/playground/CodePlayground';

/**
 * Dedicated Full-Screen Code Studio Page (VSCode / LeetCode style).
 * Features split code editor with draggable bottom console terminal.
 */
const PlaygroundPage = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#090d16', color: '#f8fafc', overflow: 'hidden' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
        <CodePlayground fullScreen={true} />
      </main>
    </div>
  );
};

export default PlaygroundPage;
