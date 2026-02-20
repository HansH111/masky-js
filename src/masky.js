class inputMask {
  constructor() {
    if (inputMask._instance) {
      return inputMask._instance;
    }
    inputMask._instance = this;

    this.inputs = null;
    this._inputData = new Map();
    this.tokens = {
      '0': {
        validateRule: /\d/,
      },
      'A': {
        validateRule: /[a-zA-Z0-9]/,
      },
      'S': {
        validateRule: /[a-zA-Z]/,
      },
    };
    this._allowTokensRegex = new RegExp(`[${Object.keys(this.tokens).join('')}]`, 'g');
    this._regexCache = {};
    this._CHAR_WIDTH = 8.4;
    this._PADDING = 20;
    this.init();
  }

  destroy() {
    this._inputData.forEach((data, input) => {
      const { listeners, typeSet } = data;
      input.removeEventListener('keydown', listeners.checkKeydown);
      input.removeEventListener('input', listeners.maskInput);
      input.removeEventListener('focus', listeners.checkFocus);
      input.removeEventListener('blur', listeners.validateInput);

      if (typeSet) {
        input.removeAttribute('type');
      }
    });
    this._inputData.clear();
  }

  reinit() {
    this.destroy();
    this.getInput();
  }

  init() {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', this.init.bind(this));
      return;
    }
    this.getInput();
  }

  getInput() {
    this.inputs = document.querySelectorAll('input[data-mask]');

    this.inputs.forEach((input) => {
      if (this._inputData.has(input)) {
        return;
      }

      const mask = input.dataset.mask;

      const hadType = input.hasAttribute('type');
      this.setInputMode(input, mask);
      const typeSet = !hadType && input.type === 'number';

      this.setInputLength(input, mask);
      this.setInputWidth(input, mask);

      const listeners = {
        checkKeydown: this.checkKeydown.bind(this),
        maskInput: this.maskInput.bind(this),
        checkFocus: this.checkFocus.bind(this),
        validateInput: this.validateInput.bind(this),
      };

      input.addEventListener('keydown', listeners.checkKeydown);
      input.addEventListener('input', listeners.maskInput);
      input.addEventListener('focus', listeners.checkFocus);
      input.addEventListener('blur', listeners.validateInput);

      this._inputData.set(input, { listeners, typeSet });
    });
  }

  checkKeydown(event) {
    const input = event.target;
    if (input.type === 'number' && input.noDec === 0 && (event.key === '.' || event.key === ',')) {
      event.preventDefault();
    }
  }

  _calculateWidth(mask) {
    const width = Math.ceil(mask.length * this._CHAR_WIDTH + this._PADDING);
    return width + 'px';
  }

  setInputWidth(input, mask) {
    const fontFamily = (input.style.fontFamily || '').toLowerCase();
    if (input.hasAttribute('size') || input.style.width || fontFamily !== 'monospace') {
      return;
    }
    input.style.width = this._calculateWidth(mask);
  }

  setInputLength(input, mask) {
    if (!input.hasAttribute('minlength')) {
      if (input.type === 'number') {
        input.setAttribute('minlength', 1);
      } else {
        input.setAttribute('minlength', mask.length);
      }
    }

    if (!input.hasAttribute('maxlength')) {
      input.setAttribute('maxlength', mask.length);
    }
  }

  setInputMode(input, mask) {
    const splitVal = mask.split('.');
    input.noDec = splitVal.length > 1 ? splitVal[1].length : 0;

    if (!input.hasAttribute('type')) {
      const textMask = mask.replace(/[.,0]/g, '');
      input.type = textMask.length > 0 ? 'text' : 'number';
    }

    if (input.type === 'number') {
      input.inputMode = input.noDec > 0 ? 'decimal' : 'numeric';
    }
  }

  _formatNumber(input) {
    if (input.type !== 'number' || !input.value) {
      return;
    }

    const num = Number(input.value);
    if (isNaN(num)) {
      return;
    }

    if (input.noDec > 0) {
      input.value = num.toFixed(input.noDec);
    } else {
      input.value = Math.round(num).toString();
    }
    input.classList.add('masky-number');
  }

  maskInput(event) {
    const input = event.target;
    input.setCustomValidity('');

    if (event.inputType === 'deleteContentBackward') {
      return;
    }

    if (input.type === 'number') {
      const val = input.value.replace(/[^\d.-]/g, '');
      const splitVal = val.split('.');
      if (input.noDec > 0) {
        if (splitVal.length === 2 && splitVal[1].length > input.noDec) {
          input.value = splitVal[0] + '.' + splitVal[1].substring(0, input.noDec);
        }
      } else if (input.noDec === 0 && splitVal.length > 1) {
        input.value = splitVal[0];
      }
    } else {
      const mask = input.dataset.mask;
      const unmaskedValue = this.removeMask(mask, input.value);

      const maskedValue = this.applyMask(
        unmaskedValue,
        mask
      );
      input.value = maskedValue;
      input.checkValidity();
    }
  }

  removeMask(mask, value) {
    if (!mask || !value) {
      return value;
    }

    const maskLiteralsToRemove = mask.replace(this._allowTokensRegex, '');

    if (!this._regexCache[mask]) {
      this._regexCache[mask] = new RegExp(`[${maskLiteralsToRemove}]`, 'g');
    }
    return value.replace(this._regexCache[mask], '');
  }

  applyMask(unmaskedValue, mask) {
    if (!unmaskedValue) {
      return unmaskedValue;
    }

    let maskedValue = '';
    let valueIndex = 0;
    const maskChars = mask.split('');

    for (let i = 0; i < maskChars.length; i++) {
      if (this.tokens[maskChars[i]]) {
        const token = this.tokens[maskChars[i]];
        if (token.validateRule.test(unmaskedValue[valueIndex]) && unmaskedValue[valueIndex]) {
          maskedValue += unmaskedValue[valueIndex];
          valueIndex++;
        } else {
          break;
        }
      } else {
        maskedValue += maskChars[i];
      }
    }
    return maskedValue;
  }

  // on Focus check type and alignment
  checkFocus(event) {
    const input = event.target;
    if (input.type === 'number') {
      input.classList.remove('masky-number');
    }
  }

  // on blur execute validation
  validateInput(event) {
    const input = event.target;
    const value = input.value;
    const currentLength = value.length;
    const minLength = parseInt(input.getAttribute('minlength'), 10);

    if (currentLength > 0 && currentLength < minLength) {
      const defaultMessage = `The minimum number of characters required is ${minLength}. Please complete the field.`;
      input.setCustomValidity(defaultMessage);
      input.reportValidity();
      return;
    }

    const customValidator = input.dataset.maskValidate;
    if (customValidator && typeof window[customValidator] === 'function') {
      const msg = window[customValidator](value, input);
      if (msg) {
        input.setCustomValidity(msg);
        input.reportValidity();
        return;
      }
    }
    this._formatNumber(input);
    input.setCustomValidity('');
  }
}
const masky = new inputMask();
