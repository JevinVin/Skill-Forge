import React from 'react';
import Navbar from '../components/layout/Navbar';
import CodePlayground from '../components/playground/CodePlayground';

/**
 * Dedicated Code Studio Page — rendered with a soft, harmonious dark theme palette.
 */
const PlaygroundPage = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#141417', color: '#ffffff', overflow: 'hidden' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', overflow: 'hidden', backgroundColor: '#141417' }}>
        <CodePlayground fullScreen={true} />
      </main>
    </div>
  );
};

export default PlaygroundPage;
