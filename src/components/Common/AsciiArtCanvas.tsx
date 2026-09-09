'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface AsciiArtCanvasProps {
  imageSrc: string;
  className?: string;
  resolution?: number; // character density step (higher = coarser, lower = finer)
  colorMode?: 'original' | 'terracotta' | 'gold' | 'monochrome';
  interactive?: boolean;
}

const ASCII_CHARS = '@%#*+=-:. ';
const CHAR_MAP_LEN = ASCII_CHARS.length;

export default function AsciiArtCanvas({
  imageSrc,
  className = '',
  resolution = 6,
  colorMode = 'terracotta',
  interactive = true
}: AsciiArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1, y: -1, active: false });
  const animFrameRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load Image
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      if (!active) return;
      imgRef.current = img;
      setIsLoaded(true);
    };
    img.onerror = () => {
      if (!active) return;
      console.warn("Could not load image for ASCII conversion:", imageSrc);
    };
    return () => {
      active = false;
    };
  }, [imageSrc]);

  // Render loop
  const renderAscii = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Offscreen sampling
    const offscreen = document.createElement('canvas');
    const cols = Math.floor(width / resolution);
    const rows = Math.floor(height / (resolution * 1.5));
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.drawImage(img, 0, 0, cols, rows);
    const imgData = offCtx.getImageData(0, 0, cols, rows);
    const pixels = imgData.data;

    // Clear canvas
    ctx.fillStyle = '#080B0F';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${resolution * 1.3}px monospace`;
    ctx.textBaseline = 'top';

    const mouse = mousePosRef.current;
    const charW = width / cols;
    const charH = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4;
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];
        const alpha = pixels[i + 3];

        if (alpha < 20) continue;

        // Luminance
        const brightness = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        const charIdx = Math.floor((1 - brightness) * (CHAR_MAP_LEN - 1));
        const char = ASCII_CHARS[Math.max(0, Math.min(CHAR_MAP_LEN - 1, charIdx))];

        const posX = c * charW;
        const posY = r * charH;

        // Mouse distance for glow interaction
        let glow = 1;
        if (mouse.active && interactive) {
          const dx = posX - mouse.x;
          const dy = posY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            glow = 1 + (1 - dist / 120) * 1.5;
          }
        }

        // Color modes
        if (colorMode === 'original') {
          ctx.fillStyle = `rgb(${Math.min(255, red * glow)}, ${Math.min(255, green * glow)}, ${Math.min(255, blue * glow)})`;
        } else if (colorMode === 'terracotta') {
          const tR = Math.min(255, Math.floor(224 * brightness * glow));
          const tG = Math.min(255, Math.floor(86 * brightness * glow + 40 * (1 - brightness)));
          const tB = Math.min(255, Math.floor(56 * brightness * glow + 20));
          ctx.fillStyle = `rgb(${tR}, ${tG}, ${tB})`;
        } else if (colorMode === 'gold') {
          const gR = Math.min(255, Math.floor(212 * brightness * glow));
          const gG = Math.min(255, Math.floor(175 * brightness * glow));
          const gB = Math.min(255, Math.floor(85 * brightness * glow));
          ctx.fillStyle = `rgb(${gR}, ${gG}, ${gB})`;
        } else {
          const mono = Math.min(255, Math.floor(brightness * 255 * glow));
          ctx.fillStyle = `rgb(${mono}, ${mono}, ${mono})`;
        }

        ctx.fillText(char, posX, posY);
      }
    }
  }, [resolution, colorMode, interactive]);

  // Handle resize & draw
  useEffect(() => {
    if (!isLoaded) return;

    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      renderAscii();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded, renderAscii]);

  // Mouse handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mousePosRef.current = {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
      active: true
    };
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(renderAscii);
  };

  const handleMouseLeave = () => {
    mousePosRef.current.active = false;
    renderAscii();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full overflow-hidden select-none bg-[#080B0F] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-[#E05638] bg-stone-900/80">
          <span className="animate-pulse">Matnli ASCII render qilinmoqda...</span>
        </div>
      )}
    </div>
  );
}
