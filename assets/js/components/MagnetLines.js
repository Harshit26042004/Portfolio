class MagnetLines {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.magnet-lines-container');
    this.lineCount = options.lineCount || 6;
    this.baseStroke = options.baseStroke || 0.3;
    this.activeStroke = options.activeStroke || 0.8;
    this.baseColor = options.baseColor || 'var(--accent-color)';
    this.baseOpacity = options.baseOpacity || 0.15;
    this.activeOpacity = options.activeOpacity || 0.6;
    this.maxDistance = options.maxDistance || 180;
    this.spring = options.spring || 0.12;
    this.damping = options.damping || 0.22;
    this.targetContainer = options.targetContainer || null;

    this._mouse = { x: -999, y: -999, vx: 0, vy: 0 };
    this._rafId = null;
    this._isVisible = false;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svg.setAttribute('class', 'magnet-lines-svg');
    this._svg.setAttribute('width', '100%');
    this._svg.setAttribute('height', '100%');
    this._svg.setAttribute('preserveAspectRatio', 'none');
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';

    this._lines = [];
    for (let i = 0; i < this.lineCount; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-linecap', 'round');
      line._currentX1 = 0;
      line._currentY1 = 0;
      line._currentX2 = 0;
      line._currentY2 = 0;
      line._targetX1 = 0;
      line._targetY1 = 0;
      line._targetX2 = 0;
      line._targetY2 = 0;
      this._svg.appendChild(line);
      this._lines.push(line);
    }

    this.container.appendChild(this._svg);

    this._resize();
    this._bindEvents();
  }

  _bindEvents() {
    const trackEl = this.targetContainer || this.container;

    trackEl.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this._mouse.x = e.clientX - rect.left;
      this._mouse.y = e.clientY - rect.top;
      this._mouse.vx = e.movementX || 0;
      this._mouse.vy = e.movementY || 0;
      if (!this._isVisible) {
        this._isVisible = true;
        this._loop();
      }
    });

    trackEl.addEventListener('mouseleave', () => {
      this._isVisible = false;
    });

    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    this._containerWidth = rect.width || 1;
    this._containerHeight = rect.height || 1;
    this._svg.setAttribute('viewBox', `0 0 ${this._containerWidth} ${this._containerHeight}`);
  }

  _loop = () => {
    if (!this._isVisible) {
      this._fadeOut();
      return;
    }

    const centerX = this._containerWidth / 2;
    const centerY = this._containerHeight / 2;

    this._lines.forEach((line, i) => {
      const angle = (i / this.lineCount) * Math.PI * 2;
      const sourceX = centerX + Math.cos(angle) * this._containerWidth * 0.35;
      const sourceY = centerY + Math.sin(angle) * this._containerHeight * 0.35;

      const dx = this._mouse.x - sourceX;
      const dy = this._mouse.y - sourceY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const strength = Math.max(0, 1 - dist / this.maxDistance);
      const velocity = Math.sqrt(this._mouse.vx * this._mouse.vx + this._mouse.vy * this._mouse.vy) * 0.005;
      const influence = strength + velocity;

      const dirX = dx === 0 ? 0 : dx / dist;
      const dirY = dy === 0 ? 0 : dy / dist;

      const endX = sourceX + dirX * this._containerWidth * 0.15 * influence;
      const endY = sourceY + dirY * this._containerHeight * 0.15 * influence;

      line._targetX1 = sourceX;
      line._targetY1 = sourceY;
      line._targetX2 = endX;
      line._targetY2 = endY;

      line._currentX1 += (line._targetX1 - line._currentX1) * this.spring;
      line._currentY1 += (line._targetY1 - line._currentY1) * this.spring;
      line._currentX2 += (line._targetX2 - line._currentX2) * this.damping;
      line._currentY2 += (line._targetY2 - line._currentY2) * this.damping;

      line.setAttribute('x1', line._currentX1);
      line.setAttribute('y1', line._currentY1);
      line.setAttribute('x2', line._currentX2);
      line.setAttribute('y2', line._currentY2);

      const targetStroke = this.baseStroke + (this.activeStroke - this.baseStroke) * influence;
      const targetOpacity = this.baseOpacity + (this.activeOpacity - this.baseOpacity) * influence;
      line.setAttribute('stroke-width', targetStroke);
      line.setAttribute('opacity', targetOpacity);
    });

    this._rafId = requestAnimationFrame(this._loop);
  }

  _fadeOut() {
    this._lines.forEach((line) => {
      line._targetX2 = line._currentX1;
      line._targetY2 = line._currentY1;
      line._currentX2 += (line._targetX2 - line._currentX2) * 0.08;
      line._currentY2 += (line._targetY2 - line._currentY2) * 0.08;
      line.setAttribute('x2', line._currentX2);
      line.setAttribute('y2', line._currentY2);
      const currentOpacity = parseFloat(line.getAttribute('opacity') || this.baseOpacity);
      line.setAttribute('opacity', Math.max(0, currentOpacity - 0.015));
      line.setAttribute('stroke-width', this.baseStroke);
    });

    const allFaded = this._lines.every(l => parseFloat(l.getAttribute('opacity') || 0) < 0.02);
    if (!allFaded) {
      this._rafId = requestAnimationFrame(this._fadeOut);
    }
  }

  destroy() {
    this._isVisible = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._svg && this._svg.parentNode === this.container) {
      this.container.removeChild(this._svg);
    }
  }

  static initAll() {
    const instances = [];
    document.querySelectorAll('.magnet-lines-container').forEach(container => {
      const target = container.dataset.targetContainer ?
        document.querySelector(container.dataset.targetContainer) : null;
      instances.push(new MagnetLines({
        container: container,
        targetContainer: target
      }));
    });
    return instances;
  }
}

window.MagnetLines = MagnetLines;