class DecryptedText {
  constructor(element, options = {}) {
    this.el = element;
    this.text = options.text || element.dataset.decrypted || element.textContent;
    this.speed = options.speed || 50;
    this.delimiter = options.delimiter || '|';
    this.animateOn = options.animateOn || 'hover';
    this.revealDuration = options.revealDuration || 800;
    this.charSet = options.charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$&*!';
    this.isAnimating = false;
    this._originalHTML = element.innerHTML;
    this._chars = this.text.split('');
    this._revealed = new Array(this._chars.length).fill(false);
    this.init();
  }

  init() {
    if (this.animateOn === 'auto' || this.animateOn === 'load') {
      this.start();
    } else if (this.animateOn === 'hover') {
      this.el.style.cursor = 'default';
      this.el.addEventListener('mouseenter', () => this.start());
    } else if (this.animateOn === 'click') {
      this.el.style.cursor = 'pointer';
      this.el.addEventListener('click', () => this.start());
    }
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this._revealed.fill(false);
    this._runReveal();
  }

  _runReveal() {
    let iteration = 0;
    const maxIterations = Math.ceil(this._chars.length / 1);

    const interval = setInterval(() => {
      const output = this._chars.map((char, i) => {
        if (char === ' ' || char === '<' || this._revealed[i]) {
          return char;
        }
        if (iteration >= i) {
          this._revealed[i] = true;
          return char;
        }
        return this.charSet[Math.floor(Math.random() * this.charSet.length)];
      });

      const rendered = this._renderWithPreservedTags(output.join(''));
      this.el.innerHTML = rendered;

      if (this._revealed.every(Boolean) || iteration >= this._chars.length) {
        clearInterval(interval);
        this.el.innerHTML = this._renderWithPreservedTags(this.text);
        this.isAnimating = false;
        if (this.options && this.options.onComplete) {
          this.options.onComplete();
        }
      }

      iteration++;
    }, this.speed);
  }

  _renderWithPreservedTags(text) {
    return text;
  }

  static initAll() {
    document.querySelectorAll('.decrypted-text').forEach(el => {
      new DecryptedText(el, {
        text: el.dataset.text || el.textContent,
        speed: parseInt(el.dataset.speed) || 50,
        animateOn: el.dataset.animateOn || 'hover'
      });
    });
  }
}

window.DecryptedText = DecryptedText;