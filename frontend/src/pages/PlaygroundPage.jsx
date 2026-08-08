import React from 'react';
import Navbar from '../components/layout/Navbar';
import CodePlayground from '../components/playground/CodePlayground';

/**
 * Dedicated Code Playground Page — accessible globally from top navigation bar.
 */
const PlaygroundPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <CodePlayground />
      </main>
    </div>
  );
};

export default PlaygroundPage;
