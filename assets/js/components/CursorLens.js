/**
 * CursorLens - Neo-Brutalism Cursor Lens Component
 * A circular lens that transforms the content beneath the cursor into a
 * vivid neo-brutalist reality (saturated + high-contrast via backdrop-filter),
 * framed by a thick hard-shadow ring, with contextual states and labels.
 */
(function(global) {
  'use strict';

  const CursorLens = {
    _stateMap: [
      { selector: 'a[href], .lanyard, .lanyard-link', state: 'view', label: 'VIEW' },
      { selector: 'button, input[type="submit"], .btn', state: 'open', label: 'OPEN' },
      { selector: '.skill-badge, .lanyard-tag', state: 'explore', label: 'EXPLORE' },
      { selector: '.social-links a, .header-social-links a', state: 'view', label: 'SOCIAL' },
      { selector: '.theme-toggle', state: 'mode', label: 'MODE' },
      { selector: 'a[download]', state: 'save', label: 'SAVE' },
      { selector: 'form input, form textarea', state: 'type', label: 'TYPE' },
    ],

    init() {
      if (this._isTouch()) return;
      this._build();
      this._bind();
      if (this._reducedMotion()) {
        this.el.classList.add('cursor-lens--still');
      }
    },

    _build() {
      if (document.querySelector('.cursor-lens')) return;

      this.el = document.createElement('div');
      this.el.className = 'cursor-lens';
      this.el.innerHTML = `
        <div class="cursor-lens__move">
          <div class="cursor-lens__ring"></div>
          <div class="cursor-lens__circle"></div>
          <div class="cursor-lens__dot"></div>
          <div class="cursor-lens__label"></div>
        </div>
      `;
      document.body.appendChild(this.el);

      this.move = this.el.querySelector('.cursor-lens__move');
      this.ring = this.el.querySelector('.cursor-lens__ring');
      this.circle = this.el.querySelector('.cursor-lens__circle');
      this.dot = this.el.querySelector('.cursor-lens__dot');
      this.label = this.el.querySelector('.cursor-lens__label');

      this.mouseX = 0;
      this.mouseY = 0;
      this.visible = false;
      this.state = 'default';
      this.size = 88;
    },

    _bind() {
      document.addEventListener('mousemove', this._onMove.bind(this), { passive: true });
      document.addEventListener('mouseenter', () => this._show(true));
      document.addEventListener('mouseleave', () => this._show(false));
      document.addEventListener('mousedown', () => this._setState('drag'));
      document.addEventListener('mouseup', () => this._evaluate());
    },

    _onMove(e) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      const speed = Math.hypot(e.movementX || 0, e.movementY || 0);
      this.size = Math.min(140, Math.max(72, 88 + speed * 0.4));

      this.el.style.setProperty('--lens-size', this.size + 'px');
      this.move.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0)`;
      this.label.style.transform = `translate(-50%, ${this.size / 2 + 18}px)`;

      this._evaluate(e.target);
    },

    _evaluate(target) {
      if (!target) {
        target = document.elementFromPoint(this.mouseX, this.mouseY);
      }
      if (!target) return;

      for (const item of this._stateMap) {
        if (target.closest(item.selector)) {
          this._setState(item.state, item.label);
          return;
        }
      }
      this._setState('default');
    },

    _setState(state, label) {
      this.state = state;
      for (const item of this._stateMap) {
        this.el.classList.remove('cursor-lens--' + item.state);
      }
      this.el.classList.remove('cursor-lens--drag');

      if (state !== 'default') {
        this.el.classList.add('cursor-lens--' + state);
      }

      if (label) {
        this.label.textContent = label;
        this.el.classList.add('cursor-lens--has-label');
      } else {
        this.el.classList.remove('cursor-lens--has-label');
      }
    },

    _show(visible) {
      this.visible = visible;
      this.el.classList.toggle('is-visible', visible);
    },

    _isTouch() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    _reducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    destroy() {
      if (this.el) this.el.remove();
      document.removeEventListener('mousemove', this._onMove);
    }
  };

  global.CursorLens = CursorLens;
})(window);