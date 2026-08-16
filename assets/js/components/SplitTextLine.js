/**
 * SplitTextLine - Animated typography component
 * Splits text into words/lines and animates them progressively on load or scroll.
 */
(function(global) {
  'use strict';

  const SplitTextLine = {
    init() {
      const elements = document.querySelectorAll('[data-split-line]');
      elements.forEach((el, index) => {
        this.createSplit(el, index * 150);
      });
    },

    createSplit(el, delay) {
      const text = el.textContent || '';
      const words = text.split(' ').filter(w => w.length > 0);

      el.innerHTML = '';

      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'split-word';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.opacity = '0';
        wordSpan.style.transform = 'translateY(100%)';

        const letters = word.split('').map(char => {
          const letterSpan = document.createElement('span');
          letterSpan.className = 'split-letter';
          letterSpan.style.display = 'inline-block';
          letterSpan.textContent = char;
          return letterSpan.outerHTML;
        });

        wordSpan.innerHTML = letters.join('');

        const wordDelay = delay + (wordIndex * 150);
        wordSpan.style.transitionDelay = wordDelay + 'ms';

        el.appendChild(wordSpan);
        if (wordIndex < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      /* Trigger animation on load */
      setTimeout(() => {
        const wordSpans = el.querySelectorAll('.split-word');
        wordSpans.forEach(word => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        });
      }, 100);
    },

    initWithObserver() {
      const elements = document.querySelectorAll('[data-split-line]');
      if (!elements.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const words = el.querySelectorAll('.split-word');
            words.forEach((word, i) => {
              word.style.transitionDelay = (i * 100) + 'ms';
              word.style.opacity = '1';
              word.style.transform = 'translateY(0)';
            });
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.3 });

      elements.forEach(el => {
        /* Pre-split the text */
        const text = el.textContent || '';
        const words = text.split(' ').filter(w => w.length > 0);

        el.innerHTML = '';
        words.forEach((word, wordIndex) => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'split-word';
          wordSpan.style.display = 'inline-block';
          wordSpan.style.opacity = '0';
          wordSpan.style.transform = 'translateY(80px)';
          wordSpan.innerHTML = word.split('').map(char => {
            return '<span class="split-letter">' + (char === ' ' ? '&nbsp;' : char) + '</span>';
          }).join('');
          wordSpan.style.transition = 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.22, 1, 0.37, 1)';
          el.appendChild(wordSpan);
          if (wordIndex < words.length - 1) {
            el.appendChild(document.createTextNode(' '));
          }
        });

        observer.observe(el);
      });
    }
  };

  global.SplitTextLine = SplitTextLine;
})(window);
