class PreText {
  constructor(options = {}) {
    this.target = options.target || document.querySelector('.pretext');
    this.speed = options.speed || 60;
    this.delay = options.delay || 0;
    this.onComplete = options.onComplete || null;
    this._chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    this._isRunning = false;
    if (this.target) this.init();
  }

  init() {
    const text = this.target.dataset.text || this.target.textContent.trim();
    this._fullText = text;
    this._displayText = text;

    const template = [];
    const length = text.length;
    for (let i = 0; i < length; i++) {
      const char = text[i];
      if (char === ' ') {
        template.push('<span class="pretext-space"> </span>');
      } else if (char === '<' && text.substr(i, 4) === '<br>') {
        template.push('<br>');
        i += 3;
      } else {
        template.push(
          `<span class="pretext-char" data-char="${char}">${char}</span>`
        );
      }
    }
    this.target.innerHTML = template.join('');
    this.target.classList.add('pretext--ready');

    setTimeout(() => this.reveal(), this.delay);
  }

  reveal() {
    if (this._isRunning) return;
    this._isRunning = true;
    const chars = this.target.querySelectorAll('.pretext-char');
    const total = chars.length;
    let done = 0;
    const cycle = () => {
      chars.forEach((el, idx) => {
        if (el.classList.contains('pretext-done')) return;
        const randomChar = this._chars[Math.floor(Math.random() * this._chars.length)];
        el.textContent = randomChar;
        el.classList.add('pretext-scramble');
      });

      if (done < total) {
        const nextIdx = done;
        chars[nextIdx].textContent = chars[nextIdx].dataset.char;
        chars[nextIdx].classList.remove('pretext-scramble');
        chars[nextIdx].classList.add('pretext-done');
        done++;
        setTimeout(cycle, this.speed * 0.6 + Math.random() * this.speed);
      } else {
        this._isRunning = false;
        this.target.classList.add('pretext--complete');
        this.target.classList.add('pretext--done');
        if (this.onComplete) this.onComplete();
      }
    };
    cycle();
  }

  static create(el, text, options = {}) {
    el.dataset.text = text;
    return new PreText({ target: el, ...options });
  }
}

window.PreText = PreText;