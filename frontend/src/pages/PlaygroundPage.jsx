import React from 'react';
import Navbar from '../components/layout/Navbar';
import CodePlayground from '../components/playground/CodePlayground';

/**
 * Dedicated Jet Black Code Studio Page.
 */
const PlaygroundPage = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', color: '#ffffff', overflow: 'hidden' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', overflow: 'hidden', backgroundColor: '#000000' }}>
        <CodePlayground fullScreen={true} />
      </main>
    </div>
  );
};

export default PlaygroundPage;
