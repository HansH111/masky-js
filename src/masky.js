class InputMask {
  static #instance;
  #data = new Map();
  #tokens = {
    '0': { validate: /\d/ },
    'A': { validate: /[a-zA-Z0-9]/ },
    'S': { validate: /[a-zA-Z]/ },
  };
  #tokenChars = Object.keys(this.#tokens).join('');
  #tokenRe = new RegExp(`[${this.#tokenChars}]`, 'g');
  #regexCache = {};
  #charWidth = 8.4;
  #padding = 20;

  constructor() {
    if (InputMask.#instance) return InputMask.#instance;
    InputMask.#instance = this;
    this.#init();
  }

  #init() {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => this.#init(), { once: true });
      return;
    }
    document.querySelectorAll('input[data-mask]:not([data-masky-init])')
      .forEach(el => this.#setupInput(el));
  }

  #setupInput(input) {
    const mask = input.dataset.mask;
    input.dataset.maskyInit = '';
    
    const hadType = input.hasAttribute('type');
    this.#setModeAndType(input, mask);
    const typeChanged = !hadType && input.type === 'number';

    this.#setLengths(input, mask);
    this.#setWidth(input, mask);

    const handlers = {
      keydown: e => this.#onKeydown(e),
      input:   e => this.#onInput(e),
      focus:   e => this.#onFocus(e),
      blur:    e => this.#onBlur(e),
    };

    Object.entries(handlers).forEach(([ev, fn]) =>
      input.addEventListener(ev, fn)
    );

    this.#data.set(input, { handlers, typeChanged });
  }

  #setModeAndType(input, mask) {
    const parts = mask.split('.');
    input.noDec = parts.length > 1 ? parts[1].length : 0;

    if (!input.hasAttribute('type')) {
      const hasLetters = mask.replace(/[.,0]/g, '').length > 0;
      input.type = hasLetters ? 'text' : 'number';
    }

    if (input.type === 'number') {
      input.inputMode = input.noDec > 0 ? 'decimal' : 'numeric';
    }
  }

  #setLengths(input, mask) {
    if (!input.hasAttribute('minlength'))
      input.minLength = input.type === 'number' ? 1 : mask.length;
    if (!input.hasAttribute('maxlength'))
      input.maxLength = mask.length;
  }

  #setWidth(input, mask) {
    if (input.style.width || input.hasAttribute('size')) return;
 
    const style = getComputedStyle(input);
    if (style.fontFamily.toLowerCase().includes('monospace')) {
        input.style.width = `${Math.ceil(mask.length * this.#charWidth + this.#padding)}px`;
    }
  }

  #onKeydown(e) {
    const { target: input } = e;
    if (input.type !== 'number' || input.noDec > 0) return;
    if (e.key === '.' || e.key === ',') e.preventDefault();
  }

  #onInput(e) {
    const input = e.target;
    input.setCustomValidity('');

    if (e.inputType === 'deleteContentBackward') return;

    if (input.type === 'number') {
      let val = input.value.replace(/[^\d.-]/g, '');
      const [int, dec = ''] = val.split('.');
      if (input.noDec === 0) {
        input.value = int;
      } else if (dec.length > input.noDec) {
        input.value = int + '.' + dec.slice(0, input.noDec);
      }
      return;
    }

    const mask = input.dataset.mask;
    const clean = this.#removeMask(input.value, mask);
    input.value = this.#applyMask(clean, mask);
  }

  #removeMask(value, mask) {
    if (!value) return '';
    const lit = mask.replace(this.#tokenRe, '');
    const re = this.#regexCache[mask] ||= new RegExp(`[${lit}]`, 'g');
    return value.replace(re, '');
  }

  #applyMask(clean, mask) {
    if (!clean) return '';
    let result = '', i = 0;
    for (const c of mask) {
      if (this.#tokens[c]) {
        if (i >= clean.length) break;
        if (this.#tokens[c].validate.test(clean[i])) {
          result += clean[i++];
        }
      } else {
        result += c;
      }
    }
    return result;
  }

  #onFocus(e) {
    if (e.target.type === 'number') {
      e.target.classList.remove('masky-number');
    }
  }

  #onBlur(e) {
    const input = e.target;
    const val = input.value.trim();
    const min = +input.minLength;

    if (val && val.length < min) {
      input.setCustomValidity(`Minimum ${min} characters required.`);
      input.reportValidity();
      return;
    }

    const validator = input.dataset.maskValidate;
    if (validator && typeof window[validator] === 'function') {
      const msg = window[validator](val, input);
      if (msg) {
        input.setCustomValidity(msg);
        input.reportValidity();
        return;
      }
    }

    if (input.type === 'number' && val) {
      const num = +val;
      if (!isNaN(num)) {
        input.value = input.noDec > 0 ? num.toFixed(input.noDec) : Math.round(num) + '';
        input.classList.add('masky-number');
      }
    }

    input.setCustomValidity('');
  }

  destroy() {
    this.#data.forEach(({ handlers, typeChanged }, input) => {
      Object.keys(handlers).forEach(ev =>
        input.removeEventListener(ev, handlers[ev])
      );
      if (typeChanged) input.removeAttribute('type');
    });
    this.#data.clear();
  }

  reinit() {
    this.destroy();
    this.#init();
  }
}
const masky = new InputMask();
