class ParticleTypography {
  constructor(element, options = {}) {
    this.el = element;
    this.options = {
      fontSize: options.fontSize || 48,
      particleSize: options.particleSize || 2,
      particleColor: options.particleColor || '#e87532',
      backgroundColor: options.backgroundColor || 'transparent',
      particleDensity: options.particleDensity || 1.2,
      animationDuration: options.animationDuration || 2000,
      autoInit: options.autoInit !== false,
      ...options
    };
    this._canvas = null;
    this._ctx = null;
    this._particles = [];
    this._fontSize = this.options.fontSize;
    this._text = this.el.textContent || this.el.dataset.text || '';
    this._width = 0;
    this._height = 0;
    this._mouse = { x: null, y: null };
    this._isRevealing = false;
    this._needsRedraw = false;

    if (this.options.autoInit) {
      this._init();
    }
  }

  _init() {
    if (!this.el) return;

    this._width = this.el.offsetWidth || this.el.scrollWidth || 400;
    this._height = this.options.fontSize * 1.2 + 20;
    this.el.style.height = this._height + 'px';
    this._fontSize = Math.min(this.options.fontSize, this._width / (this._text.length * 0.6));

    this._canvas = document.createElement('canvas');
    this._canvas.className = 'particle-typography-canvas';
    this._canvas.width = this._width;
    this._canvas.height = this._height;
    this._canvas.style.width = '100%';
    this._canvas.style.height = '100%';
    this._canvas.style.display = 'block';
    this._canvas.style.position = 'absolute';
    this._canvas.style.inset = '0';

    const computed = getComputedStyle(this.el);
    if (computed.position === 'static') {
      this.el.style.position = 'relative';
    }
    this.el.style.overflow = 'hidden';
    this.el.appendChild(this._canvas);

    this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });

    this._generateParticles();
    this._animateIn();
  }

  _generateParticles() {
    this._particles = [];

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = this._width;
    tempCanvas.height = this._height;

    tempCtx.clearRect(0, 0, this._width, this._height);
    tempCtx.fillStyle = '#000';
    tempCtx.font = `${this._fontSize}px ${this.options.fontFamily || 'Questrial, sans-serif'}`;
    tempCtx.textBaseline = 'middle';
    tempCtx.textAlign = 'center';
    tempCtx.fillText(this._text, this._width / 2, this._height / 2);

    const imageData = tempCtx.getImageData(0, 0, this._width, this._height);
    const data = imageData.data;

    const step = Math.max(1, Math.floor(3 / this.options.particleDensity));

    for (let y = 0; y < this._height; y += step) {
      for (let x = 0; x < this._width; x += step) {
        const idx = (y * this._width + x) * 4;
        if (data[idx + 3] > 0) {
          this._particles.push({
            x: Math.random() * this._width,
            y: Math.random() * this._height,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            size: (this.options.particleSize * data[idx + 3]) / 255 || this.options.particleSize * 0.5,
            alpha: 0
          });
        }
      }
    }
  }

  _animateIn() {
    this._isRevealing = true;
    this._animate();
  }

  _animate = () => {
    if (!this._canvas.isConnected) return;

    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._width, this._height);

    if (this._isRevealing) {
      let allDone = true;
      this._particles.forEach(p => {
        if (p.alpha < 0.95) {
          p.alpha += 0.02;
          allDone = false;
        }
      });
      if (allDone) {
        this._isRevealing = false;
        this._needsRedraw = true;
      }
    }

    if (this._mouse.x !== null && !this._isRevealing) {
      this._particles.forEach(p => {
        const dx = p.x - this._mouse.x;
        const dy = p.y - this._mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (1 - dist / 80) * 2;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }
      });
    }

    this._particles.forEach(p => {
      p.vx *= 0.85;
      p.vy *= 0.85;
      p.vx += (p.targetX - p.x) * 0.05;
      p.vy += (p.targetY - p.y) * 0.05;
      p.x += p.vx;
      p.y += p.vy;

      if (this._mouse.x !== null && !this._isRevealing) {
        p.x += Math.sin(performance.now() * 0.001 + p.targetX * 0.01) * 0.05;
      }

      ctx.fillStyle = this.options.particleColor;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    if (this._needsRedraw || this._isRevealing) {
      this._rafId = requestAnimationFrame(this._animate);
    }
  }

  _setupMouseTracking(container) {
    container.addEventListener('mousemove', (e) => {
      const rect = this._canvas.getBoundingClientRect();
      this._mouse.x = e.clientX - rect.left;
      this._mouse.y = e.clientY - rect.top;
      if (!this._needsRedraw && !this._isRevealing) {
        this._needsRedraw = true;
        this._animate();
      }
    });

    container.addEventListener('mouseleave', () => {
      this._mouse.x = null;
      this._mouse.y = null;
      this._needsRedraw = false;
    });
  }

  reveal() {
    if (!this._isRevealing) {
      this._particles.forEach(p => {
        p.alpha = 0;
      });
      this._isRevealing = true;
      this._animate();
    }
  }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._canvas && this._canvas.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
  }

  static initAll() {
    const instances = [];
    document.querySelectorAll('.particle-typography').forEach(el => {
      const instance = new ParticleTypography(el, {
        fontSize: parseInt(el.dataset.fontSize) || 48,
        particleSize: parseInt(el.dataset.particleSize) || 2,
        text: el.textContent.trim()
      });
      instances.push(instance);
    });
    return instances;
  }
}

window.ParticleTypography = ParticleTypography;