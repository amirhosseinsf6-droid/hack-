
import React, { useEffect, useRef } from 'react';

const BloodRain: React.FC<{ color?: string }> = ({ color = '#C00' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Use more aggressive symbols
    const characters = '💀☣☢☠🩸01010173829465X';
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Randomly brighten some drops
        const isBright = Math.random() > 0.95;
        ctx.fillStyle = isBright ? '#ff4d4d' : color;
        ctx.font = `${fontSize}px monospace`;
        ctx.shadowBlur = isBright ? 10 : 0;
        ctx.shadowColor = '#f00';

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 40);

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-50" />;
};

export default BloodRain;
