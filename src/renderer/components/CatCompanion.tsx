import React, { useState, useEffect, useRef } from 'react';
import type { CatMood, TaskStorageData } from '../../types/todo.js';
import { sound } from '../utils/sound.js';
import '../styles/cat.css';

interface CatCompanionProps {
  initialMood?: CatMood;
}

export const CatCompanion: React.FC<CatCompanionProps> = ({ initialMood = 'idle' }) => {
  const [mood, setMood] = useState<CatMood>(initialMood);
  const [tasksData, setTasksData] = useState<TaskStorageData | null>(null);
  const [bubbleText, setBubbleText] = useState<string>('Click me! 🐾');
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const isMouseDownRef = useRef<boolean>(false);

  // Load initial tasks and set up IPC listeners
  useEffect(() => {
    if (window.catApi) {
      window.catApi.getTasks().then((data) => {
        setTasksData(data);
        sound.setEnabled(data.settings.soundEnabled);
      });

      const unsubTasks = window.catApi.onTasksUpdated((data) => {
        setTasksData(data);
        sound.setEnabled(data.settings.soundEnabled);
      });

      const unsubMood = window.catApi.onCatMoodChanged((newMood) => {
        setMood(newMood);
      });

      return () => {
        unsubTasks();
        unsubMood();
      };
    }
  }, []);

  // Natural blinking interval
  useEffect(() => {
    if (mood === 'sleepy' || mood === 'rolling') return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [mood]);

  // Dynamic speech bubble messages based on mood and tasks
  useEffect(() => {
    if (!tasksData) return;
    const pending = tasksData.tasks.filter((t) => !t.completed).length;

    if (mood === 'celebrating') {
      setBubbleText('Purr-fect! All done! 🎉');
      setShowBubble(true);
    } else if (mood === 'walking') {
      setBubbleText('Taking my stroll! 🐾');
      setShowBubble(true);
    } else if (mood === 'rolling') {
      setBubbleText('Rolling on my back! 🔄');
      setShowBubble(true);
    } else if (mood === 'happy') {
      setBubbleText('Good job! 🐾');
      setShowBubble(true);
    } else if (mood === 'sleepy') {
      if (tasksData.tasks.length === 0) {
        setBubbleText('Nothing to do! Time to nap 💤');
      } else {
        setBubbleText('All tasks finished! Zzz... 💤');
      }
      setShowBubble(true);
    } else if (pending > 0) {
      setBubbleText(`${pending} task${pending > 1 ? 's' : ''} left! 📋`);
    } else {
      setBubbleText('Click me! 🐾');
    }

    if (mood === 'idle' && !isHovered) {
      const timer = setTimeout(() => setShowBubble(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [mood, tasksData, isHovered]);

  // Walks after every 5 seconds (5,000 ms) as requested
  useEffect(() => {
    const FIVE_SECONDS_MS = 5 * 1000;
    const walkTimer = setInterval(() => {
      if (mood === 'idle' && !isMouseDownRef.current && !isHovered) {
        window.catApi?.walkCat?.();
      }
    }, FIVE_SECONDS_MS);

    return () => clearInterval(walkTimer);
  }, [mood, isHovered]);

  // Drag & Click differentiation
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.screenX, y: e.screenY };
    lastPosRef.current = { x: e.screenX, y: e.screenY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const deltaX = moveEvent.screenX - lastPosRef.current.x;
      const deltaY = moveEvent.screenY - lastPosRef.current.y;

      const totalDist = Math.hypot(
        moveEvent.screenX - dragStartRef.current.x,
        moveEvent.screenY - dragStartRef.current.y
      );

      if (totalDist > 4) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current) {
        lastPosRef.current = { x: moveEvent.screenX, y: moveEvent.screenY };
        window.catApi?.moveCatWindow(deltaX, deltaY);
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (!hasMovedRef.current) {
        // It was a click!
        sound.playMeow();
        window.catApi?.togglePanel();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const currentEffectiveMood = isHovered && mood === 'idle' ? 'curious' : mood;

  return (
    <div
      className="cat-desktop-wrapper"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowBubble(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      title="Click me to open your tasks, drag to reposition!"
    >
      {/* Discreet, Cute Pixel Tasks Button (unobtrusive, full cat visible) */}
      <button
        type="button"
        className="tasks-floating-btn"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          sound.playMeow();
          window.catApi?.togglePanel();
        }}
        title="Open or close To-Do List"
      >
        <span>📋</span>
        <span>Tasks</span>
      </button>

      {/* Friendly Pixel Speech Bubble */}
      {showBubble && <div className="cat-bubble">{bubbleText}</div>}

      {/* Floating Particles */}
      {currentEffectiveMood === 'sleepy' && (
        <>
          <div className="zzz-particle zzz-1">z</div>
          <div className="zzz-particle zzz-2">Z</div>
          <div className="zzz-particle zzz-3">Z</div>
        </>
      )}

      {(currentEffectiveMood === 'happy' || currentEffectiveMood === 'rolling') && (
        <>
          <div className="heart-particle heart-1">💖</div>
          <div className="heart-particle heart-2">✨</div>
        </>
      )}

      {currentEffectiveMood === 'celebrating' && (
        <>
          <div className="celebrate-sparkle" style={{ top: 8, left: 12, fontSize: 16 }}>✨</div>
          <div className="celebrate-sparkle" style={{ top: 4, right: 16, fontSize: 18, animationDelay: '0.4s' }}>🌟</div>
          <div className="celebrate-sparkle" style={{ top: 20, right: 8, fontSize: 15, animationDelay: '0.8s' }}>🎊</div>
        </>
      )}

      {/* ======================================================== */}
      {/* 1. WALKING POSE: THIN PIXEL BLACK CAT ON ALL 4 LEGS      */}
      {/* ======================================================== */}
      {currentEffectiveMood === 'walking' ? (
        <div className="pixel-cat-container pixel-walk-4legs-wrapper">
          <svg
            viewBox="0 0 130 110"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
            style={{ overflow: 'visible' }}
          >
            {/* Ground Pixel Shadow */}
            <rect x="25" y="98" width="75" height="4" fill="rgba(10, 10, 12, 0.3)" />

            {/* Back Right Leg (far) */}
            <g className="pixel-walk-br">
              <rect x="88" y="66" width="6" height="28" fill="#1C1C22" />
              <rect x="88" y="92" width="8" height="4" fill="#0C0C0E" />
            </g>

            {/* Front Right Leg (far) */}
            <g className="pixel-walk-fr">
              <rect x="52" y="66" width="6" height="28" fill="#1C1C22" />
              <rect x="52" y="92" width="8" height="4" fill="#0C0C0E" />
            </g>

            {/* Thin Long Pixel Tail */}
            <g className="pixel-walk-tail">
              <rect x="96" y="56" width="6" height="8" fill="#121215" />
              <rect x="100" y="46" width="6" height="12" fill="#121215" />
              <rect x="104" y="34" width="6" height="14" fill="#121215" />
              <rect x="108" y="24" width="6" height="12" fill="#18181F" />
              <rect x="112" y="18" width="6" height="8" fill="#2A2A35" />
            </g>

            {/* Slender Thin Body */}
            <rect x="38" y="52" width="58" height="18" rx="2" fill="#121215" />
            {/* Subtle Spine Highlight */}
            <rect x="42" y="52" width="50" height="3" fill="#24242E" />

            {/* Back Left Leg (near) */}
            <g className="pixel-walk-bl">
              <rect x="78" y="66" width="6" height="30" fill="#121215" />
              <rect x="78" y="94" width="8" height="4" fill="#24242E" />
            </g>

            {/* Front Left Leg (near) */}
            <g className="pixel-walk-fl">
              <rect x="38" y="66" width="6" height="30" fill="#121215" />
              <rect x="38" y="94" width="8" height="4" fill="#24242E" />
            </g>

            {/* Cute Pixel Head */}
            <g>
              {/* Left Ear */}
              <rect x="22" y="20" width="8" height="18" fill="#121215" />
              <rect x="24" y="14" width="6" height="8" fill="#121215" />
              <rect x="26" y="8" width="4" height="8" fill="#121215" />
              <rect x="25" y="16" width="3" height="8" fill="#FDA4AF" />

              {/* Right Ear */}
              <rect x="38" y="20" width="8" height="18" fill="#121215" />
              <rect x="40" y="14" width="6" height="8" fill="#121215" />
              <rect x="40" y="8" width="4" height="8" fill="#121215" />
              <rect x="41" y="16" width="3" height="8" fill="#FDA4AF" />

              {/* Head Block */}
              <rect x="18" y="28" width="32" height="26" rx="2" fill="#121215" />
              <rect x="22" y="28" width="24" height="3" fill="#24242E" />

              {/* Glowing Emerald-Gold Pixel Eyes */}
              <rect x="22" y="36" width="7" height="9" fill="#10B981" />
              <rect x="23" y="37" width="5" height="7" fill="#34D399" />
              <rect x="25" y="38" width="3" height="5" fill="#064E3B" />
              <rect x="23" y="37" width="2" height="2" fill="#FFFFFF" />

              <rect x="37" y="36" width="7" height="9" fill="#10B981" />
              <rect x="38" y="37" width="5" height="7" fill="#34D399" />
              <rect x="40" y="38" width="3" height="5" fill="#064E3B" />
              <rect x="38" y="37" width="2" height="2" fill="#FFFFFF" />

              {/* Cute Tiny Pink Nose */}
              <rect x="32" y="44" width="3" height="2" fill="#FB7185" />

              {/* Pixel Whisker Lines */}
              <rect x="8" y="43" width="9" height="1.5" fill="#3F3F46" />
              <rect x="9" y="47" width="8" height="1.5" fill="#3F3F46" />
              <rect x="48" y="43" width="9" height="1.5" fill="#3F3F46" />
              <rect x="48" y="47" width="8" height="1.5" fill="#3F3F46" />

              {/* Rosy Cheeks */}
              <rect x="19" y="44" width="4" height="2" fill="#F43F5E" opacity="0.6" />
              <rect x="44" y="44" width="4" height="2" fill="#F43F5E" opacity="0.6" />
            </g>
          </svg>
        </div>
      ) : currentEffectiveMood === 'rolling' ? (
        /* ======================================================== */
        /* 2. ROLLING POSE: THIN PIXEL CAT ON ITS BACK             */
        /* ======================================================== */
        <div className="pixel-cat-container pixel-roll-back-wrapper">
          <svg
            viewBox="0 0 130 110"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
            style={{ overflow: 'visible' }}
          >
            {/* Ground Pixel Shadow */}
            <rect x="30" y="90" width="70" height="5" fill="rgba(10, 10, 12, 0.35)" />

            {/* Slender Body Lying on Back */}
            <rect x="38" y="72" width="56" height="16" rx="3" fill="#121215" />
            <rect x="46" y="74" width="40" height="5" fill="#24242E" />

            {/* Thin Tail Wagging on Floor */}
            <rect x="94" y="78" width="12" height="4" fill="#121215" />
            <rect x="104" y="74" width="12" height="4" fill="#18181F" />
            <rect x="114" y="68" width="6" height="6" fill="#2A2A35" />

            {/* 4 Thin Paws Up in the Air! */}
            {/* Front Left Paw */}
            <g className="pixel-roll-paw-fl">
              <rect x="44" y="50" width="5" height="24" fill="#121215" />
              <rect x="43" y="48" width="7" height="4" fill="#FDA4AF" />
            </g>

            {/* Front Right Paw */}
            <g className="pixel-roll-paw-fr">
              <rect x="56" y="48" width="5" height="26" fill="#18181F" />
              <rect x="55" y="46" width="7" height="4" fill="#FDA4AF" />
            </g>

            {/* Back Left Paw */}
            <g className="pixel-roll-paw-bl">
              <rect x="74" y="50" width="5" height="24" fill="#121215" />
              <rect x="73" y="48" width="7" height="4" fill="#FDA4AF" />
            </g>

            {/* Back Right Paw */}
            <g className="pixel-roll-paw-br">
              <rect x="84" y="48" width="5" height="26" fill="#18181F" />
              <rect x="83" y="46" width="7" height="4" fill="#FDA4AF" />
            </g>

            {/* Head Resting Happy Backwards */}
            <g transform="translate(20, 60)">
              {/* Ears */}
              <polygon points="4,12 0,0 12,6" fill="#121215" />
              <polygon points="5,10 2,3 10,6" fill="#FDA4AF" />
              <polygon points="18,12 24,0 14,6" fill="#121215" />
              <polygon points="18,10 22,3 15,6" fill="#FDA4AF" />

              {/* Head Base */}
              <rect x="2" y="8" width="22" height="18" rx="2" fill="#121215" />

              {/* Happy Squinting Closed Eyes ^ ^ */}
              <rect x="5" y="14" width="4" height="2" fill="#34D399" />
              <rect x="7" y="12" width="2" height="2" fill="#34D399" />

              <rect x="14" y="14" width="4" height="2" fill="#34D399" />
              <rect x="16" y="12" width="2" height="2" fill="#34D399" />

              {/* Tiny Pink Nose */}
              <rect x="11" y="17" width="2" height="2" fill="#FB7185" />
              {/* Cheerful Blush */}
              <rect x="3" y="18" width="4" height="2" fill="#F43F5E" opacity="0.6" />
              <rect x="17" y="18" width="4" height="2" fill="#F43F5E" opacity="0.6" />
            </g>
          </svg>
        </div>
      ) : (
        /* ======================================================== */
        /* 3. SITTING / IDLE POSE: CUTE SMALL THIN PIXEL BLACK CAT  */
        /* ======================================================== */
        <div
          className={`pixel-cat-container ${
            currentEffectiveMood === 'happy'
              ? 'pixel-happy-bounce'
              : currentEffectiveMood === 'sleepy'
              ? 'pixel-sleepy-breathe'
              : 'pixel-breathe-idle'
          }`}
        >
          <svg
            viewBox="0 0 120 115"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
            style={{ overflow: 'visible' }}
          >
            {/* Ground Pixel Shadow */}
            <rect x="32" y="102" width="56" height="4" fill="rgba(10, 10, 12, 0.3)" />

            {/* Thin Graceful Pixel Tail */}
            <g className="pixel-tail-sway">
              <rect x="76" y="88" width="6" height="8" fill="#121215" />
              <rect x="80" y="80" width="6" height="10" fill="#121215" />
              <rect x="84" y="70" width="6" height="12" fill="#121215" />
              <rect x="88" y="58" width="6" height="14" fill="#18181F" />
              <rect x="92" y="48" width="6" height="12" fill="#24242E" />
              <rect x="90" y="42" width="6" height="8" fill="#383845" />
            </g>

            {/* Slender Thin Body */}
            <rect x="44" y="58" width="32" height="40" rx="3" fill="#121215" />
            {/* Subtle Chest Highlight */}
            <rect x="47" y="60" width="26" height="4" fill="#24242E" />

            {/* Slender Front Legs */}
            <rect x="46" y="80" width="6" height="24" fill="#121215" />
            <rect x="45" y="100" width="8" height="4" fill="#24242E" />

            <rect x="68" y="80" width="6" height="24" fill="#121215" />
            <rect x="67" y="100" width="8" height="4" fill="#24242E" />

            {/* Cute Pixel Kitten Head */}
            <g>
              {/* Left Pointed Pixel Ear */}
              <rect x="36" y="18" width="8" height="16" fill="#121215" />
              <rect x="38" y="12" width="6" height="8" fill="#121215" />
              <rect x="40" y="6" width="4" height="8" fill="#121215" />
              <rect x="39" y="14" width="3" height="8" fill="#FDA4AF" />

              {/* Right Pointed Pixel Ear */}
              <rect x="76" y="18" width="8" height="16" fill="#121215" />
              <rect x="76" y="12" width="6" height="8" fill="#121215" />
              <rect x="76" y="6" width="4" height="8" fill="#121215" />
              <rect x="78" y="14" width="3" height="8" fill="#FDA4AF" />

              {/* Head Block */}
              <rect x="34" y="24" width="52" height="36" rx="3" fill="#121215" />
              <rect x="40" y="24" width="40" height="3" fill="#24242E" />

              {/* Rosy Pixel Blushing Cheeks */}
              <rect x="36" y="46" width="5" height="3" fill="#F43F5E" opacity="0.6" />
              <rect x="79" y="46" width="5" height="3" fill="#F43F5E" opacity="0.6" />

              {/* Eyes */}
              {currentEffectiveMood === 'sleepy' ? (
                /* Sleepy Closed Pixel Eyes */
                <g>
                  <rect x="42" y="38" width="8" height="2" fill="#34D399" />
                  <rect x="70" y="38" width="8" height="2" fill="#34D399" />
                </g>
              ) : currentEffectiveMood === 'happy' ? (
                /* Happy Squinting Eyes ^ ^ */
                <g>
                  <rect x="42" y="38" width="7" height="2" fill="#34D399" />
                  <rect x="44" y="36" width="3" height="2" fill="#34D399" />
                  <rect x="69" y="38" width="7" height="2" fill="#34D399" />
                  <rect x="71" y="36" width="3" height="2" fill="#34D399" />
                </g>
              ) : isBlinking ? (
                /* Blinking Eyes */
                <g>
                  <rect x="42" y="38" width="8" height="2" fill="#10B981" />
                  <rect x="70" y="38" width="8" height="2" fill="#10B981" />
                </g>
              ) : (
                /* Big Glowing Emerald-Gold Pixel Eyes */
                <g>
                  {/* Left Eye */}
                  <rect x="41" y="32" width="10" height="12" fill="#10B981" />
                  <rect x="42" y="33" width="8" height="10" fill="#34D399" />
                  <rect x="45" y="35" width="4" height="7" fill="#064E3B" />
                  <rect x="42" y="33" width="3" height="3" fill="#FFFFFF" />
                  <rect x="47" y="40" width="2" height="2" fill="#FBBF24" />

                  {/* Right Eye */}
                  <rect x="69" y="32" width="10" height="12" fill="#10B981" />
                  <rect x="70" y="33" width="8" height="10" fill="#34D399" />
                  <rect x="71" y="35" width="4" height="7" fill="#064E3B" />
                  <rect x="70" y="33" width="3" height="3" fill="#FFFFFF" />
                  <rect x="75" y="40" width="2" height="2" fill="#FBBF24" />
                </g>
              )}

              {/* Tiny Cute Pink Nose */}
              <rect x="58" y="44" width="4" height="2.5" fill="#FB7185" />

              {/* Cute Pixel Mouth :3 */}
              <rect x="56" y="48" width="3" height="1.5" fill="#3F3F46" />
              <rect x="61" y="48" width="3" height="1.5" fill="#3F3F46" />
              <rect x="59" y="47" width="2" height="1.5" fill="#3F3F46" />

              {/* Pixel Whiskers */}
              <rect x="18" y="43" width="14" height="1.5" fill="#3F3F46" />
              <rect x="20" y="48" width="12" height="1.5" fill="#3F3F46" />
              <rect x="88" y="43" width="14" height="1.5" fill="#3F3F46" />
              <rect x="88" y="48" width="12" height="1.5" fill="#3F3F46" />
            </g>

            {/* Celebrating Party Hat */}
            {currentEffectiveMood === 'celebrating' && (
              <g transform="translate(52, 2)">
                <polygon points="8,0 0,20 16,20" fill="#F59E0B" />
                <rect x="2" y="14" width="12" height="2" fill="#EF4444" />
                <rect x="5" y="8" width="6" height="2" fill="#3B82F6" />
                <rect x="7" y="0" width="3" height="3" fill="#FBBF24" />
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
};
