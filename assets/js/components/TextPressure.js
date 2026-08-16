class TextPressure {
  constructor(element, options = {}) {
    this.el = element;
    this.options = {
      minWeight: 400,
      maxWeight: 700,
      minSpacing: -2,
      maxSpacing: 2,
      minScale: 0.98,
      maxScale: 1,
      duration: 0.3,
      easing: 'cubic-bezier(0.25, 0.42, 0.75, 0.98)',
      ...options
    };
    this._isActive = false;
    this._rafId = null;
    this._currentWeight = this.options.minWeight;
    this._currentSpacing = this.options.minSpacing;
    this._currentScale = this.options.minScale;

    this.init();
  }

  init() {
    if (!this.el) return;
    this.el.style.fontWeight = this.options.minWeight;
    this.el.style.letterSpacing = this.options.minSpacing + 'px';
    this.el.style.transform = `scale(${this.options.minScale})`;
    this.el.style.transformOrigin = 'center center';
    this.el.style.transition = `all ${this.options.duration}ms ${this.options.easing}`;
    this.el.style.display = 'inline-block';

    if (this.el.dataset.pressure === 'hover') {
      this.el.addEventListener('mouseenter', () => this.activate());
      this.el.addEventListener('mouseleave', () => this.deactivate());
    } else if (this.el.dataset.pressure === 'scroll') {
      this._setupScrollObserver();
    }
  }

  activate() {
    if (this._isActive) return;
    this._isActive = true;
    this._apply(this.options.maxWeight, this.options.maxSpacing, this.options.maxScale);
  }

  deactivate() {
    if (!this._isActive) return;
    this._isActive = false;
    this._apply(this.options.minWeight, this.options.minSpacing, this.options.minScale);
  }

  _apply(weight, spacing, scale) {
    this._currentWeight = weight;
    this._currentSpacing = spacing;
    this._currentScale = scale;
    this.el.style.fontWeight = weight;
    this.el.style.letterSpacing = spacing + 'px';
    this.el.style.transform = `scale(${scale})`;
  }

  _setupScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activate();
        } else {
          this.deactivate();
        }
      });
    }, { threshold: 0.5 });
    observer.observe(this.el);
  }

  static initAll() {
    document.querySelectorAll('.text-pressure').forEach(el => {
      new TextPressure(el, {
        minWeight: parseInt(el.dataset.minWeight) || 400,
        maxWeight: parseInt(el.dataset.maxWeight) || 700,
        duration: parseInt(el.dataset.duration) || 300
      });
    });
  }
}

window.TextPressure = TextPressure;