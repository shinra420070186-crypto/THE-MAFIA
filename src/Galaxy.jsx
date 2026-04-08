import React, { useEffect, useRef } from 'react';
import './Galaxy.css';

export default function Galaxy({ 
  density = 1, 
  starSpeed = 0.5, 
  speed = 1,
  twinkleIntensity = 0.3
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width, height;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const stars = [];
    // Adjust number of stars based on screen size and density
    const numStars = Math.floor((width * height / 3000) * density);

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * starSpeed,
        dy: (Math.random() - 0.5) * starSpeed,
        alpha: Math.random(),
        twinkleDir: Math.random() > 0.5 ? 1 : -1
      });
    }

    const render = () => {
      // Very dark background to match the theme
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);
      
      stars.forEach(star => {
        // Move stars
        star.x += star.dx * speed;
        star.y += star.dy * speed;
        
        // Wrap stars around the screen edges
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle effect
        star.alpha += (0.015 * star.twinkleDir * twinkleIntensity);
        if (star.alpha <= 0.1) {
          star.alpha = 0.1;
          star.twinkleDir = 1;
        } else if (star.alpha >= 1) {
          star.alpha = 1;
          star.twinkleDir = -1;
        }
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, starSpeed, speed, twinkleIntensity]);

  return (
    <div className="galaxy-container">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}