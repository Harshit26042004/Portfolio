class Lanyard {
  constructor(element, options = {}) {
    this.el = element;
    this.options = {
      rotationFactor: options.rotationFactor || 12,
      stiffness: options.stiffness || 0.05,
      damping: options.damping || 0.15,
      ...options
    };
    this._mouseX = 0;
    this._mouseY = 0;
    this._targetRotationX = 0;
    this._targetRotationY = 0;
    this._currentRotationX = 0;
    this._currentRotationY = 0;
    this._isHovered = false;
    this._isFlipped = false;
    this._hasBackFace = false;
    this._rafId = null;
    this._init();
  }

  _init() {
    if (!this.el) return;

    const inner = this.el.querySelector('.lanyard-inner');
    const strap = this.el.querySelector('.lanyard-strap');
    if (!inner) return;

    this._inner = inner;
    this._strap = strap;
    this._hasStrap = !!strap;

    this._hasBackFace = !!this.el.querySelector('.lanyard-back');

    this._setup3D();
    this._setupDrag();
    this._setupHover();
    this._setupFlip();

    this._loop();
  }

  _setup3D() {
    this.el.style.perspective = '1000px';
    this.el.style.perspectiveOrigin = 'center center';

    this._inner.style.transformStyle = 'preserve-3d';
    this._inner.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';

    if (this._hasStrap) {
      this._strap.style.transformStyle = 'preserve-3d';
      this._strap.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
    }
  }

  _setupDrag() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
      this._isDragging = true;
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      this._targetRotationY += deltaX * 0.5;
      this._targetRotationX -= deltaY * 0.5;

      this._clampRotations();

      startX = clientX;
      startY = clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      this._isDragging = false;
    };

    this.el.addEventListener('mousedown', handleMouseDown);
    this.el.addEventListener('touchstart', handleMouseDown, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
  }

  _setupHover() {
    this.el.addEventListener('mouseenter', () => {
      this._isHovered = true;
      this._isHoveredChanged = true;
    });
    this.el.addEventListener('mouseleave', () => {
      this._isHovered = false;
      this._isHoveredChanged = true;
      this._targetRotationX = 0;
      this._targetRotationY = 0;
    });

    this.el.addEventListener('mousemove', (e) => {
      if (this._isDragging) return;
      const rect = this.el.getBoundingClientRect();
      this._mouseX = e.clientX - rect.left;
      this._mouseY = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      this._targetRotationY = ((this._mouseX - centerX) / centerX) * this.options.rotationFactor;
      this._targetRotationX = -((this._mouseY - centerY) / centerY) * this.options.rotationFactor;
    });
  }

  _clampRotations() {
    const maxRot = 120;
    this._targetRotationY = Math.max(-maxRot, Math.min(maxRot, this._targetRotationY));
    this._targetRotationX = Math.max(-maxRot, Math.min(maxRot, this._targetRotationX));
  }

  _setupFlip() {
    if (!this._hasBackFace) return;

    this.el.style.cursor = 'pointer';

    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      this._isFlipped = !this._isFlipped;
    });
  }

  _loop = () => {
    if (this._currentRotationX !== this._targetRotationX || this._currentRotationY !== this._targetRotationY) {
      this._currentRotationX += (this._targetRotationX - this._currentRotationX) * this.options.damping;
      this._currentRotationY += (this._targetRotationY - this._currentRotationY) * this.options.stiffness;

      this._currentRotationX *= 0.95;
      this._currentRotationY *= 0.95;

      if (Math.abs(this._currentRotationX) < 0.01) this._currentRotationX = 0;
      if (Math.abs(this._currentRotationY) < 0.01) this._currentRotationY = 0;
    }

    const flipDelta = this._hasBackFace && this._isFlipped ? 180 : 0;
    const totalRotY = this._currentRotationY + flipDelta;

    const transform = `rotateX(${this._currentRotationX}deg) rotateY(${totalRotY}deg)`;
    this._inner.style.transform = transform;

    if (this._hasStrap) {
      const strapAngle = this._isHovered ?
        Math.sin(performance.now() * 0.0015) * 2 + this._currentRotationY * 0.1 :
        Math.sin(performance.now() * 0.002) * 3;
      this._strap.style.transform = `rotateX(${this._currentRotationX * 0.3}deg) rotateY(${totalRotY}deg) rotate(${strapAngle}deg)`;
    }

    this._rafId = requestAnimationFrame(this._loop);
  }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  static initAll() {
    const instances = [];
    document.querySelectorAll('.lanyard').forEach(el => {
      instances.push(new Lanyard(el));
    });
    return instances;
  }
}

window.Lanyard = Lanyard;