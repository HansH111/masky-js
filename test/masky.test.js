/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Masky JS Library', () => {
  let container;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    // Reset modules to reload the script and trigger the "new inputMask()" execution
    vi.resetModules();
  });

  const loadScript = async () => {
    // We import the file. Since it executes "new inputMask()" at the bottom,
    // it will scan the current DOM for inputs.
    await import('../src/masky.js');
  };

  const createInput = (attributes = {}) => {
    const input = document.createElement('input');
    for (const [key, value] of Object.entries(attributes)) {
      input.setAttribute(key, value);
    }
    document.body.appendChild(input);
    return input;
  };

  const triggerInputEvent = (input, value) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const triggerBlurEvent = (input) => {
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  };

  describe('Mask Application', () => {
    it('should apply a simple numeric mask (000.000) as number input', async () => {
      const input = createInput({ 'data-mask': '000.000' });
      await loadScript();

      expect(input.type).toBe('number');
      expect(input.noDecimals).toBe(3);

      triggerInputEvent(input, '123456');
      expect(input.value).toBe('123456');
    });

    it('should apply a date mask (00/00/0000)', async () => {
      const input = createInput({ 'data-mask': '00/00/0000' });
      await loadScript();

      triggerInputEvent(input, '27012026');
      expect(input.value).toBe('27/01/2026');
    });

    it('should apply an alphanumeric mask (AAA-000)', async () => {
      const input = createInput({ 'data-mask': 'AAA-000' });
      await loadScript();

      triggerInputEvent(input, 'ABC1234'); // Extra char should be ignored
      expect(input.value).toBe('ABC-123');
    });

    it('should handle reverse masking (currency-like)', async () => {
      const input = createInput({ 
        'data-mask': '0.000.000,00', 
        'data-mask-reverse': 'true' 
      });
      await loadScript();

      expect(input.type).toBe('number');

      triggerInputEvent(input, '123456');
      expect(input.value).toBe('123456');
    });
  });

  describe('Validation', () => {
    describe('MinLength', () => {
       it('should set minLength to 1 for number type inputs', async () => {
        const input = createInput({ 'data-mask': '000' });
        await loadScript();
        
        expect(input.type).toBe('number');
        expect(input.minLength).toBe(1);
       });
       
       it('should report error if length is insufficient on blur', async () => {
         const input = createInput({ 'data-mask': 'SSS', type: 'text' });
         await loadScript();
         
         triggerInputEvent(input, 'AB'); // Only 2 chars
         triggerBlurEvent(input);
         
         expect(input.validity.customError).toBe(true);
         expect(input.validationMessage).toContain('minimum number of characters');
       });
    });

    describe('Custom Validation', () => {
      it('should call custom validation function on blur', async () => {
        window.customValidator = vi.fn((value) => null);
        const input = createInput({ 
          'data-mask': '000', 
          'data-mask-validate': 'customValidator' 
        });
        await loadScript();

        triggerInputEvent(input, '123');
        triggerBlurEvent(input);

        expect(window.customValidator).toHaveBeenCalledWith('123', input);
        expect(input.validity.customError).toBe(false);
      });

      it('should show error when custom validation fails', async () => {
        window.customValidator = vi.fn((value) => value === '123' ? null : 'Invalid value');
        const input = createInput({ 
          'data-mask': '000', 
          'data-mask-validate': 'customValidator' 
        });
        await loadScript();

        triggerInputEvent(input, '456');
        triggerBlurEvent(input);

        expect(input.validity.customError).toBe(true);
        expect(input.validationMessage).toContain('Invalid value');
      });
    });
  });

  describe('Auto-width for Monospace Fonts', () => {
    it('should NOT set width when size attribute is present', async () => {
      const input = createInput({ 
        'data-mask': '000.000',
        'size': '10',
        style: 'font-family: monospace;'
      });
      await loadScript();

      expect(input.style.width).toBe('');
    });

    it('should NOT set width when inline style width is present', async () => {
      const input = createInput({ 
        'data-mask': '000.000',
        style: 'font-family: monospace; width: 100px;'
      });
      await loadScript();

      expect(input.style.width).toBe('100px');
    });

    it('should NOT set width for non-monospace fonts', async () => {
      const input = createInput({ 
        'data-mask': '000.000',
        style: 'font-family: Arial, sans-serif;'
      });
      await loadScript();

      expect(input.style.width).toBe('');
    });

    it('should set width based on mask length for monospace fonts', async () => {
      const input = createInput({ 
        'data-mask': '000.000',
        style: 'font-family: monospace;'
      });
      await loadScript();

      const expectedWidth = Math.ceil(7 * 8.4 + 20);
      expect(input.style.width).toBe(expectedWidth + 'px');
    });
  });

  describe('Number Input with Decimals', () => {
    it('should set type to number for numeric mask without literals', async () => {
      const input = createInput({ 'data-mask': '0000.00' });
      await loadScript();

      expect(input.type).toBe('number');
      expect(input.noDecimals).toBe(2);
      expect(input.inputMode).toBe('decimal');
    });

    it('should set inputMode to numeric for whole numbers', async () => {
      const input = createInput({ 'data-mask': '0000' });
      await loadScript();

      expect(input.type).toBe('number');
      expect(input.noDecimals).toBe(0);
      expect(input.inputMode).toBe('numeric');
    });

    it('should limit decimal places on input', async () => {
      const input = createInput({ 'data-mask': '0000.00' });
      await loadScript();

      triggerInputEvent(input, '1234.567');
      expect(input.value).toBe('1234.56');
    });

    it('should remove decimals when noDecimals is 0', async () => {
      const input = createInput({ 'data-mask': '0000', type: 'text' });
      await loadScript();

      triggerInputEvent(input, '123.456');
      expect(input.value).toBe('123');
    });

    it('should format to fixed decimals on blur', async () => {
      const input = createInput({ 'data-mask': '0000.00' });
      await loadScript();

      triggerInputEvent(input, '1234.5');
      triggerBlurEvent(input);
      expect(input.value).toBe('1234.50');
    });

    it('should round and remove decimals for whole numbers on blur', async () => {
      const input = createInput({ 'data-mask': '0000', type: 'text' });
      await loadScript();

      triggerInputEvent(input, '123.99');
      triggerBlurEvent(input);
      expect(input.value).toBe('123');
    });

    it('should add masky-number class on blur', async () => {
      const input = createInput({ 'data-mask': '0000' });
      await loadScript();

      triggerInputEvent(input, '123');
      triggerBlurEvent(input);
      expect(input.classList.contains('masky-number')).toBe(true);
    });

    it('should remove masky-number class on focus', async () => {
      const input = createInput({ 'data-mask': '0000' });
      await loadScript();

      triggerInputEvent(input, '123');
      triggerBlurEvent(input);
      expect(input.classList.contains('masky-number')).toBe(true);

      input.dispatchEvent(new Event('focus', { bubbles: true }));
      expect(input.classList.contains('masky-number')).toBe(false);
    });

    it.skip('should prevent decimal key for whole numbers', async () => {
      const input = createInput({ 'data-mask': '0000' });
      await loadScript();

      triggerInputEvent(input, '123');

      expect(input.type).toBe('number');
      expect(input.noDecimals).toBe(0);

      const event = new KeyboardEvent('keydown', { key: '.' });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });
});
