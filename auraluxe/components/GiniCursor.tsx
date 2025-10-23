'use client';

import { useEffect, useState } from 'react';

export default function GiniCursor({ active, targetSelector }: { active: boolean; targetSelector?: string }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!active || !targetSelector) {
      setPos({ x: -100, y: -100 });
      return;
    }

    const el = document.querySelector(targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      let startX = pos.x === -100 ? window.innerWidth / 2 : pos.x;
      let startY = pos.y === -100 ? window.innerHeight / 2 : pos.y;
      let progress = 0;

      const animate = () => {
        progress += 0.05;
        if (progress >= 1) {
          setPos({ x: targetX, y: targetY });
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            setTyping(true);
            setTimeout(() => setTyping(false), 1000);
          }
          return;
        }
        const x = startX + (targetX - startX) * progress;
        const y = startY + (targetY - startY) * progress;
        setPos({ x, y });
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [active, targetSelector]);

  if (!active || pos.x === -100) return null;

  return (
    <>
      <div
        className="fixed pointer-events-none transition-all duration-100"
        style={{
          left: pos.x,
          top: pos.y,
          zIndex: 100000,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 3L19 12L12 13L9 20L5 3Z"
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth="1.5"
          />
        </svg>
        <div className="absolute -top-8 left-6 bg-yellow-400 text-black px-2 py-1 text-xs rounded whitespace-nowrap">
          Gini ✨
        </div>
      </div>
      {typing && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: pos.x + 20,
            top: pos.y - 10,
            zIndex: 100000,
          }}
        >
          <div className="bg-yellow-400 text-black px-2 py-1 text-xs rounded animate-pulse">
            ⌨️ typing...
          </div>
        </div>
      )}
    </>
  );
}
