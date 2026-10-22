import React, { useState, useEffect } from 'react';
import { CatCompanion } from './components/CatCompanion.js';
import { TaskPanel } from './components/TaskPanel.js';
import { sound } from './utils/sound.js';
import './styles/webPlayground.css';

export const App: React.FC = () => {
  const [hash, setHash] = useState<string>(() => window.location.hash);
  const [isWebPanelOpen, setIsWebPanelOpen] = useState<boolean>(true);
  const [webCatPos, setWebCatPos] = useState<{ x: number; y: number }>({ x: 80, y: 140 });
  const [isDraggingCat, setIsDraggingCat] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen to web adapter panel toggles
  useEffect(() => {
    const api = window.catApi as any;
    if (api && api.onPanelVisibilityChanged) {
      const unsub = api.onPanelVisibilityChanged((isOpen: boolean) => {
        setIsWebPanelOpen(isOpen);
      });
      return unsub;
    }
  }, []);

  // Specific Electron Windows (or explicit hash views)
  if (hash.includes('panel')) {
    return <TaskPanel />;
  }
  if (hash.includes('cat')) {
    return <CatCompanion />;
  }

  // Pure Web Mode (Browser / GitHub Pages)
  const handleWalkDemo = () => {
    (window.catApi as any)?.walkCat?.();
  };

  const handleRollDemo = () => {
    (window.catApi as any)?.setCatMood?.('rolling');
    sound.playPurr();
    setTimeout(() => {
      (window.catApi as any)?.setCatMood?.('idle');
    }, 4500);
  };

  const handleTogglePanel = () => {
    sound.playPop();
    setIsWebPanelOpen((prev) => !prev);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCat) return;
    setWebCatPos({
      x: Math.max(20, Math.min(window.innerWidth - 160, e.clientX - 70)),
      y: Math.max(80, Math.min(window.innerHeight - 160, e.clientY - 70)),
    });
  };

  return (
    <div
      className="web-desktop-container"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={() => setIsDraggingCat(false)}
    >
      {/* Top App Bar */}
      <header className="web-top-bar">
        <div className="web-brand-group">
          <span className="web-brand-title">
            <span>🐾</span>
            <span>CatTask</span>
          </span>
          <span className="web-brand-badge">Pixel Black Cat Edition</span>
        </div>

        <div className="web-controls-group">
          <button
            type="button"
            className={`web-action-btn ${isWebPanelOpen ? 'active-btn' : ''}`}
            onClick={handleTogglePanel}
            title="Open or close To-Do List"
          >
            <span>📋</span>
            <span>{isWebPanelOpen ? 'Hide Tasks' : 'Show Tasks'}</span>
          </button>

          <button
            type="button"
            className="web-action-btn"
            onClick={handleWalkDemo}
            title="Watch the cat walk on all 4 legs!"
          >
            <span>🐾</span>
            <span>Walk Demo</span>
          </button>

          <button
            type="button"
            className="web-action-btn"
            onClick={handleRollDemo}
            title="Watch the cat roll playfully on its back!"
          >
            <span>🔄</span>
            <span>Roll Demo</span>
          </button>

          <a
            href="https://github.com/srinidhimatta/CatTask"
            target="_blank"
            rel="noopener noreferrer"
            className="web-action-btn"
            style={{ textDecoration: 'none' }}
          >
            <span>⭐</span>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Interactive Web Canvas */}
      <div className="web-canvas">
        {/* Draggable Desktop Cat */}
        <div
          className="web-cat-anchor"
          style={{ left: `${webCatPos.x}px`, top: `${webCatPos.y}px` }}
          onMouseDown={() => setIsDraggingCat(true)}
        >
          <CatCompanion />
        </div>

        {/* Floating Task Panel */}
        {isWebPanelOpen && (
          <div className="web-panel-floating">
            <TaskPanel />
          </div>
        )}

        {/* Helpful instructions overlay */}
        <div className="web-instructions">
          💡 Click the cat or 📋 Tasks button to toggle your to-do list • Drag the cat anywhere • Tasks auto-save!
        </div>
      </div>
    </div>
  );
};

export default App;
