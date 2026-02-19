class inputMask {
  constructor() {
    this.inputs = null;
    this.tokens = {
      '0': {
        validateRule: /\d/,
      },
      'Z': {
        validateRule: /\d/,
        optional: true,
      },
      'A': {
        validateRule: /[a-zA-Z0-9]/,
      },
      'S': {
        validateRule: /[a-zA-Z]/,
      },
    };
    this._allowTokensRegex = new RegExp(`[${Object.keys(this.tokens).join('')}]`, 'g');
    this.init();
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
      const mask = input.dataset.mask;

      this.setInputLength(input, mask);
      this.setInputMode(input, mask);

      input.addEventListener('input', this.maskInput.bind(this));
      input.addEventListener('blur', this.validateInput.bind(this));
    });
  }

  setInputLength(input, mask) {
    if(input.hasAttribute('minlength') && input.hasAttribute('maxlength')) {
        return;
    }

    const maskLength = mask.length;
    const optionalCount = (mask.match(/Z/g) || []).length;
    const requiredMaskLength = maskLength - optionalCount;

    if(!input.hasAttribute('minlength')) {
        input.minLength = requiredMaskLength;
    }

    if(!input.hasAttribute('maxlength')) {
        input.maxLength = maskLength;
    }
  }

  setInputMode(input, mask) {
    if(input.hasAttribute('inputMode')) {
      return;
    }

    const filteredTokens = [...mask].filter((char) => this.tokens[char]);
    const uniqueTokens = [...new Set(filteredTokens)];
    const isOnlyNumericMask = uniqueTokens.length === 1 && uniqueTokens[0] === '0';
    input.inputMode = isOnlyNumericMask ? 'numeric' : 'text';
  }

  maskInput(event) {
    const input = event.target;
    input.setCustomValidity('');

    if (event.inputType === 'deleteContentBackward') {
      return;
    }

    const mask = input.dataset.mask;

    const unmaskedValue = this.removeMask(mask, input.value);

    let isReverse = input.dataset.maskReverse === 'true';
    if (!input.dataset.maskReverse) {
      isReverse = mask.startsWith('Z');
    }

    const maskedValue = this.applyMask(
      unmaskedValue,
      mask,
      isReverse
    );

    input.value = maskedValue;
    input.checkValidity();
  }

  removeMask(mask, value) {
    if (!mask || !value) {
      return value;
    }

    const maskLiteralsToRemove = mask.replace(this._allowTokensRegex, '');
    const literalRegex = new RegExp(`[${maskLiteralsToRemove}]`, 'g');
    return value.replace(literalRegex, '');
  }

  applyMask(unmaskedValue, mask, isReverse) {
    if (!unmaskedValue) {
      return unmaskedValue;
    }

    let maskedValue = '';
    let valueIndex = 0;
    let maskChars = mask.split('');

    if (isReverse) {
      unmaskedValue = unmaskedValue.split('').reverse().join('');
      maskChars = maskChars.reverse();
    }

    for (let i = 0; i < maskChars.length; i++) {
      if (this.tokens[maskChars[i]]) {
        const token = this.tokens[maskChars[i]];
        if (
          token.validateRule.test(unmaskedValue[valueIndex]) &&
          unmaskedValue[valueIndex]
        ) {
          maskedValue += unmaskedValue[valueIndex];
          valueIndex++;
        } else if (token.optional) {
          continue;
        } else {
          break;
        }
      } else {
        maskedValue += maskChars[i];
      }
    }

    if (isReverse) {
      maskedValue = maskedValue.split('').reverse().join('');
      maskedValue = maskedValue.startsWith('.')
        ? maskedValue.substring(1)
        : maskedValue;
    }

    return maskedValue;
  }

  validateInput(event) {
    const input = event.target;
    const value = input.value;
    const currentLength = value.length;
    const minLength = input.minLength;

    const customValidator = input.dataset.maskValidate;
    if (customValidator && typeof window[customValidator] === 'function') {
      const isValid = window[customValidator](value, input);
      if (!isValid) {
        const defaultMessage = 'Invalid value according to custom validation.';
        input.setCustomValidity(defaultMessage);
        input.reportValidity();
        return;
      }
    }

    if (currentLength > 0 && currentLength < minLength) {
      const defaultMessage = `The minimum number of characters required is ${minLength}. Please complete the field.`;
      input.setCustomValidity(defaultMessage);
      input.reportValidity();
      return;
    }

    input.setCustomValidity('');
  }
}

new inputMask();
