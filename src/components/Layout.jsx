import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CloudConfigModal from './CloudConfigModal';

export default function Layout() {
  const [isCloudConfigOpen, setIsCloudConfigOpen] = useState(false);

  useEffect(() => {
    const handleOpenCloudConfig = () => {
      setIsCloudConfigOpen(true);
    };
    window.addEventListener('open-cloud-config', handleOpenCloudConfig);
    return () => {
      window.removeEventListener('open-cloud-config', handleOpenCloudConfig);
    };
  }, []);

  return (
    <div id="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          <div className="view-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo FSCR" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain' }} />
            <h2 id="view-title" style={{ margin: 0 }}>SGI Enterprise</h2>
          </div>
          <div id="view-container" className="view-container fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <CloudConfigModal 
        isOpen={isCloudConfigOpen} 
        onClose={() => setIsCloudConfigOpen(false)} 
      />
    </div>
  );
}
