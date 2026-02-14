/**
 * Pattern (паттерн из точек) для ритуала верификации
 */
class PatternDrawer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = options.gridSize || 5; // 5x5 сетка
    this.points = [];
    this.selectedPoints = [];
    this.isDrawing = false;
    this.onUpdate = options.onUpdate || (() => {});
    
    this.dotRadius = 8;
    this.selectedDotRadius = 12;
    this.lineWidth = 3;
    
    this.initGrid();
    this.setupEvents();
    this.draw();
  }
  
  initGrid() {
    this.points = [];
    const padding = 40;
    const spacingX = (this.canvas.width - padding * 2) / (this.gridSize - 1);
    const spacingY = (this.canvas.height - padding * 2) / (this.gridSize - 1);
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.points.push({
          x: col,
          y: row,
          px: padding + col * spacingX,
          py: padding + row * spacingY,
          selected: false
        });
      }
    }
  }
  
  setupEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      if (e.touches) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };
    
    const onStart = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      this.currentPos = getPos(e);
      this.checkPoint(this.currentPos);
      this.draw();
    };
    
    const onMove = (e) => {
      e.preventDefault();
      if (!this.isDrawing) return;
      this.currentPos = getPos(e);
      this.checkPoint(this.currentPos);
      this.draw();
    };
    
    const onEnd = (e) => {
      e.preventDefault();
      this.isDrawing = false;
      this.currentPos = null;
      this.draw();
    };
    
    this.canvas.addEventListener('mousedown', onStart);
    this.canvas.addEventListener('mousemove', onMove);
    this.canvas.addEventListener('mouseup', onEnd);
    this.canvas.addEventListener('mouseleave', onEnd);
    
    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    this.canvas.addEventListener('touchmove', onMove, { passive: false });
    this.canvas.addEventListener('touchend', onEnd, { passive: false });
  }
  
  checkPoint(pos) {
    for (const point of this.points) {
      const dx = pos.x - point.px;
      const dy = pos.y - point.py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 25 && !point.selected) {
        point.selected = true;
        this.selectedPoints.push({ x: point.x, y: point.y });
        this.onUpdate(this.selectedPoints);
        break;
      }
    }
  }
  
  clear() {
    this.selectedPoints = [];
    for (const point of this.points) {
      point.selected = false;
    }
    this.onUpdate(this.selectedPoints);
    this.draw();
  }
  
  getPattern() {
    return this.selectedPoints;
  }
  
  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Фон
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
    
    // Линии между выбранными точками
    if (this.selectedPoints.length > 1) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      
      for (let i = 0; i < this.selectedPoints.length; i++) {
        const sp = this.selectedPoints[i];
        const point = this.points.find(p => p.x === sp.x && p.y === sp.y);
        if (point) {
          if (i === 0) ctx.moveTo(point.px, point.py);
          else ctx.lineTo(point.px, point.py);
        }
      }
      
      ctx.stroke();
      
      // Линия к текущей позиции
      if (this.isDrawing && this.currentPos && this.selectedPoints.length > 0) {
        const lastSP = this.selectedPoints[this.selectedPoints.length - 1];
        const lastPoint = this.points.find(p => p.x === lastSP.x && p.y === lastSP.y);
        if (lastPoint) {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
          ctx.beginPath();
          ctx.moveTo(lastPoint.px, lastPoint.py);
          ctx.lineTo(this.currentPos.x, this.currentPos.y);
          ctx.stroke();
        }
      }
    }
    
    // Точки
    for (const point of this.points) {
      if (point.selected) {
        // Glow
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(point.px, point.py, this.selectedDotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(point.px, point.py, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Номер
        const idx = this.selectedPoints.findIndex(sp => sp.x === point.x && sp.y === point.y);
        if (idx >= 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(idx + 1, point.px, point.py - 18);
        }
      } else {
        ctx.fillStyle = 'rgba(136, 136, 170, 0.6)';
        ctx.beginPath();
        ctx.arc(point.px, point.py, this.dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(136, 136, 170, 0.3)';
        ctx.beginPath();
        ctx.arc(point.px, point.py, this.dotRadius + 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}