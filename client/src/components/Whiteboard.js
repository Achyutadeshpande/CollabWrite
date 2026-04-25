import React, { useEffect, useRef, useState } from 'react';
import './Whiteboard.css';

const Whiteboard = ({ socket, roomId, username }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const contextRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Listen for drawing events from other users
    socket.on('draw-stroke', (data) => {
      drawStroke(data);
    });

    socket.on('clear-whiteboard', () => {
      const context = contextRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('draw-stroke');
      socket.off('clear-whiteboard');
    };
  }, [socket]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = brushSize;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;
    
    // Draw locally
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    // Broadcast to other users
    socket.emit('draw-stroke', {
      roomId,
      x0: contextRef.current.currentX || offsetX,
      y0: contextRef.current.currentY || offsetY,
      x1: offsetX,
      y1: offsetY,
      color,
      brushSize
    });

    contextRef.current.currentX = offsetX;
    contextRef.current.currentY = offsetY;
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const drawStroke = (data) => {
    const { x0, y0, x1, y1, color: strokeColor, brushSize: size } = data;
    const context = contextRef.current;
    
    context.strokeStyle = strokeColor;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
  };

  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-whiteboard', { roomId });
  };

  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `whiteboard-${roomId}-${new Date().getTime()}.png`;
    link.click();
  };

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        <div className="toolbar-group">
          <label htmlFor="color">Color:</label>
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
        </div>

        <div className="toolbar-group">
          <label htmlFor="brushSize">Brush Size:</label>
          <input
            id="brushSize"
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="brush-slider"
          />
          <span className="brush-value">{brushSize}px</span>
        </div>

        <button className="btn-clear" onClick={handleClearBoard}>
          Clear Board
        </button>

        <button className="btn-download" onClick={handleDownloadBoard}>
          Download
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;
