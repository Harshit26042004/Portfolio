class InfiniteMenu {
  constructor(element, options = {}) {
    this.el = element;
    this.options = {
      speed: options.speed || 40,
      direction: options.direction || 'right',
      gap: options.gap || 24,
      autoplay: options.autoplay !== false,
      pauseOnHover: options.pauseOnHover !== false,
      ...options
    };
    this._isHovered = false;
    this._items = [];
    this._itemWidths = [];
    this._currentTime = 0;
    this._rafId = null;
    this._baseSpeed = this.options.speed;
    this._magneticDrift = 0;
    this._init();
  }

  _init() {
    if (!this.el) return;

    this._track = document.createElement('div');
    this._track.className = 'infinite-menu-track';

    const items = Array.from(this.el.children);
    items.forEach(item => {
      this._items.push({ element: item, width: 0 });
    });

    const fragment = document.createDocumentFragment();
    this._items.forEach((item, i) => {
      const clone = item.element.cloneNode(true);
      const trackItem = document.createElement('div');
      trackItem.className = 'infinite-menu-item';
      trackItem.style.minWidth = 'auto';
      trackItem.appendChild(clone);
      fragment.appendChild(trackItem);

      const trackItem2 = document.createElement('div');
      trackItem2.className = 'infinite-menu-item';
      trackItem2.style.minWidth = 'auto';
      const clone2 = item.element.cloneNode(true);
      trackItem2.appendChild(clone2);
      fragment.appendChild(trackItem2);
    });

    this._track.appendChild(fragment);
    this.el.appendChild(this._track);
    this.el.classList.add('infinite-menu');

    this._measureItems();
    this._setupEvents();
    this._setupStyles();

    if (this.options.autoplay) {
      this._loop();
    }
  }

  _measureItems() {
    const trackItems = this._track.querySelectorAll('.infinite-menu-item');
    let totalWidth = 0;
    trackItems.forEach((item, i) => {
      item.style.minWidth = 'auto';
      const width = item.offsetWidth;
      this._itemWidths[i % 2 === 0 ? i / 2 : (i - 1) / 2] = width;
      totalWidth += width;
      item.style.minWidth = width + 'px';
      item.style.marginRight = this.options.gap + 'px';
    });
    this._totalWidth = totalWidth + (this.options.gap * (trackItems.length - 1));
    this._track.style.width = (this._totalWidth * 2) + 'px';
    this._halfWidth = this._totalWidth;
  }

  _setupStyles() {
    this.el.style.overflow = 'hidden';
    this.el.style.position = 'relative';

    this._track.style.position = 'absolute';
    this._track.style.display = 'flex';
    this._track.style.alignItems = 'center';
    this._track.style.height = '100%';
  }

  _setupEvents() {
    if (this.options.pauseOnHover) {
      this.el.addEventListener('mouseenter', () => {
        this._isHovered = true;
        this._onHover(1);
      });
      this.el.addEventListener('mouseleave', () => {
        this._isHovered = false;
        this._onHover(0);
      });
    }

    /* Magnetic field effect — items react to pointer proximity */
    if (!this.options.disableMagnetic) {
      document.addEventListener('mousemove', this._onMouseMove.bind(this), { passive: true });
      document.addEventListener('mouseleave', () => {
        this._clearMagneticEffect();
      });
    }
  }

  _onMouseMove(e) {
    if (this._isHovered) return;
    if (!this._track) return;

    const rect = this.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxDist = 320;

    const strength = Math.max(0, 1 - dist / maxDist);

    if (strength > 0.05) {
      this._track.style.setProperty('--magnetic-strength', strength.toFixed(3));
      this._magneticDrift = Math.max(-28, Math.min(28, dx * 0.08 * strength));
      this.options.speed = this._baseSpeed * (1 + strength * 0.6);
    } else {
      this._clearMagneticEffect();
    }
  }

  _clearMagneticEffect() {
    if (!this._track) return;
    this._track.style.removeProperty('--magnetic-strength');
    this._magneticDrift = 0;
    this.options.speed = this._baseSpeed;
  }

  _onHover(strength) {
    if (!this._track) return;
    this._track.style.setProperty('--hover-strength', String(strength));
  }

  _loop = () => {
    if (this._isHovered) {
      this._rafId = requestAnimationFrame(this._loop);
      return;
    }

    if (!this._totalWidth) {
      this._rafId = requestAnimationFrame(this._loop);
      return;
    }

    this._currentTime += this.options.speed * 0.06;
    let progress = (this._currentTime % this._halfWidth) / this._halfWidth;

    if (this.options.direction === 'right') {
      progress = 1 - progress;
    }

    const translateX = -progress * this._halfWidth;
    this._track.style.transform = `translate3d(${translateX + this._magneticDrift}px, 0, 0)`;

    this._rafId = requestAnimationFrame(this._loop);
  };

  destroy() {
    this._isHovered = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._track && this._track.parentNode === this.el) {
      this.el.removeChild(this._track);
    }
    this.el.classList.remove('infinite-menu');
  }

  static initAll() {
    const instances = [];
    document.querySelectorAll('.infinite-menu-init').forEach(el => {
      instances.push(new InfiniteMenu(el, {
        speed: parseFloat(el.dataset.speed) || 40,
        direction: el.dataset.direction || 'right',
        gap: parseInt(el.dataset.gap) || 24,
        autoplay: el.dataset.autoplay !== 'false',
        pauseOnHover: el.dataset.pauseOnHover !== 'false'
      }));
    });
    return instances;
  }
}

window.InfiniteMenu = InfiniteMenu;