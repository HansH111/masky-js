# Masky.js

[![Bundle Size](https://img.shields.io/bundlephobia/minzip/masky-js)](https://bundlephobia.com/package/masky-js)

📦 Masky.js – A compact and **high-performance JavaScript library for input masking**. Weighing only **1.5 KB** (gzip), it’s optimized for fast loading and ideal for any project requiring lightweight, flexible, and customizable input masks.

---

## Features
- **Super Lightweight:** Only **1.5 KB gzipped**, minimizing your app's bundle size.
- **Automatic Enhancements:**
    - **inputmode support:** Dynamically adjusts for better mobile user experience.
    - **minlength and maxlength:** Automatically calculated based on the mask.
    - **Auto-width for monospace:** Automatically sizes inputs when using monospace fonts.
- **Built-in Validations:** Automatic min/max length validation and custom validation support.
- **Flexible Masks:** Create masks with token placeholders for numbers, letters, or both.
- **Ease of Use:** Just add data-mask and optional attributes—Masky.js does the rest.
- **Vanilla JS:** Works without any dependencies, making it adaptable to any environment.

---

## Usage

**Basic Example**

Add data-mask to your input fields, and the library will handle the rest:

```html
<input type="text" data-mask="(00) 00000-0000" />
<script src="dist/masky.min.js"></script>
```

**Monospace Auto-width**

When an input has a monospace font, Masky automatically adjusts the width:

```html
<input type="text" data-mask="000.000" style="font-family: monospace;" />
```

**Automatic Type Detection**

Masky automatically detects if the input should be text or number based on the mask:

- Mask with only `0` and `.` (e.g., `000.00`) → `type="number"`
- Mask with other characters (e.g., `(00)`) → `type="text"`

```html
<!-- Automatically becomes type="number" -->
<input data-mask="000.00" />

<!-- Automatically becomes type="number" with minlength=1 -->
<input data-mask="0000" />
```

**Force Text Type**

If you want text input for a mask with only numbers and dots, explicitly set `type="text"`:

```html
<!-- Force text input (useful for formatted numbers) -->
<input type="text" data-mask="000.000" />
```

## Available Tokens

Masky.js provides the following tokens for creating masks:

| Token | Description           | Example Input | Example Mask |
|-------|-----------------------|---------------|--------------|
| 0     | Numeric digits only   | 123           | 000 → 123    |
| A     | Alphanumeric          | 1aB           | AAA → 1AB    |
| S     | Alphabetic characters | abc           | SSS → abc    |

## Custom Validation

You can add custom validation using the `data-mask-validate` attribute. The validator function must be globally available and accept `(value, input)` as parameters:

```javascript
function checkCPF(value, input) {
  const cpf = value.replace(/[^\d]+/g, '');
  if (cpf.length !== 11) {
    return 'CPF must have 11 digits';
  }
  // ... validation logic
  return null; // valid
}
```

```html
<input type="text" data-mask="000.000.000-00" data-mask-validate="checkCPF" />
```

## CSS Classes

Masky.js adds CSS classes to inputs for styling:

- `masky-number` - Added to number inputs on blur (removed on focus)

Example - right-align number input after user leaves:

```css
input.masky-number {
  text-align: right;
}
```

## JavaScript API

Masky.js uses a singleton pattern. The first call creates the instance, subsequent calls return the same instance:

```javascript
const masky = new inputMask();

// Reinitialize - useful for SPAs or dynamic content
masky.reinit();

// Clean up - removes all event listeners
masky.destroy();
```

**When to use:**
- `reinit()` - Call after dynamically adding inputs to the DOM (AJAX, SPA navigation)
- `destroy()` - Call when removing the library or page cleanup

**How it works:**
- `destroy()` removes all event listeners and restores input types
- `reinit()` completely rescans the DOM for new inputs
- Works correctly with inputs that already have `type="number"` in HTML

## Why Masky.js?

- **Automatic Enhancements:** Input mode (`inputmode`), field limits (`minlength` and `maxlength`), and input width (for monospace fonts) are calculated and applied automatically based on the mask.
- **Built for Performance:** With only **1.5 KB** gzipped, it's one of the most efficient libraries available.
- **Flexibility:** Perfect for any environment—websites, frameworks, or CMS integrations.
- **Ease of Integration:** Add `data-mask` to your inputs, and Masky.js takes care of formatting, validation, and user experience.

## Example

```html
<input type="text" data-mask="(00) 00000-0000" />
<input type="text" data-mask="00/00/0000" />
<input type="text" data-mask="AAA-000" />
<script src="dist/masky.min.js"></script>
```

- No need to manually define inputmode or limits—Masky.js handles them automatically.
- When using a monospace font, the input width is automatically sized to fit the mask.

## Installation

### 🌐 Via CDN

Use Masky.js directly from a reliable CDN:

jsDelivr
```html
<script src="https://cdn.jsdelivr.net/npm/masky-js/dist/masky.min.js"></script>
```

UNPKG
```html
<script src="https://unpkg.com/masky-js/dist/masky.min.js"></script>
```

### 📦 Via npm

Masky.js is available on npm. Install it using the following command:

```bash
npm install masky-js
```

After installation, include the file in your project:

```js
import 'masky-js/dist/masky.min.js';
```

### 📂 Copy the File

For now, download or copy the file directly from the /dist directory of the repository:

1.	Go to the `/dist` folder in this repository.
2.	Download or copy the `masky.min.js` file.
3.	Include it in your project:

```html
<script src="path/to/masky.min.js"></script>
```

## Contributing
We welcome contributions! Fork the repository, create a branch, and open a pull request.

## License
This project is licensed under the [MIT License](https://mit-license.org/).
