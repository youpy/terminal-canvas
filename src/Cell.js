import { DISPLAY_MODES } from './util/displayModes';
import { encodeToVT100 } from './util/encodeToVT100';

/**
 * Wrapper around one cell in the terminal.
 * Used for filling terminal wrapper in the cursor.
 *
 * @since 3.1.0
 */
export default class Cell {
  /**
   * Create Cell instance which are able to convert itself to ASCII control sequence.
   *
   * @constructor
   * @param {String} [char] Char that you want to wrap with control sequence
   * @param {Object} [options] Options object where you can set additional style to char
   * @param {Number} [options.x] X coordinate
   * @param {Number} [options.y] Y coordinate
   * @param {Object} [options.background] Background color, fill with -1 if you don't want to use background
   * @param {Number} [options.background.r] Red channel
   * @param {Number} [options.background.g] Green channel
   * @param {Number} [options.background.b] Blue channel
   * @param {Object} [options.foreground] Foreground color, fill with -1 if you don't want to use foreground
   * @param {Number} [options.foreground.r] Red channel
   * @param {Number} [options.foreground.g] Green channel
   * @param {Number} [options.foreground.b] Blue channel
   * @param {Object} [options.display] Object with display modes
   * @param {Boolean} [options.display.bold] Bold style
   * @param {Boolean} [options.display.dim] Dim style
   * @param {Boolean} [options.display.underlined] Underlined style
   * @param {Boolean} [options.display.blink] Blink style
   * @param {Boolean} [options.display.reverse] Reverse style
   * @param {Boolean} [options.display.hidden] Hidden style
   */
  constructor(char, options = {}) {
    const {x, y, background, foreground, display} = options;

    this._char = ' ';
    this._x = 0;
    this._y = 0;
    this._background = {r: -1, g: -1, b: -1};
    this._foreground = {r: -1, g: -1, b: -1};
    this._display = {bold: false, dim: false, underlined: false, blink: false, reverse: false, hidden: false};
    this._modified = false;

    this.setChar(char);
    this.setX(x);
    this.setY(y);
    this.setBackground(background);
    this.setForeground(foreground);
    this.setDisplay(display);
    this.setModified(false);
  }

  /**
   * Get current char.
   *
   * @returns {String}
   */
  getChar() {
    return this._char;
  }

  /**
   * Set new char to cell.
   * If char is longer than 1 char, it slices string to 1 char.
   *
   * @param {String} [char]
   * @returns {Cell}
   */
  setChar(char = ' ') {
    this._char = char.slice(0, 1);
    this.setModified();

    return this;
  }

  /**
   * Get X coordinate of this cell.
   *
   * @returns {Number}
   */
  getX() {
    return this._x;
  }

  /**
   * Set new X coordinate for cell.
   *
   * @param {Number} [x=0]
   * @returns {Cell}
   */
  setX(x = 0) {
    this._x = Math.floor(x);
    this.setModified();

    return this;
  }

  /**
   * Get Y coordinate.
   *
   * @returns {Number}
   */
  getY() {
    return this._y;
  }

  /**
   * Set new Y coordinate for cell.
   *
   * @param {Number} [y=0]
   * @returns {Cell}
   */
  setY(y = 0) {
    this._y = Math.floor(y);
    this.setModified();

    return this;
  }

  /**
   * Get current background color.
   *
   * @returns {{r: Number, g: Number, b: Number}}
   */
  getBackground() {
    return this._background;
  }

  /**
   * Set new background color.
   *
   * @param {Object} [options] Object with background color
   * @param {Number} [options.r=-1] Red channel
   * @param {Number} [options.g=-1] Green channel
   * @param {Number} [options.b=-1] Blue channel
   * @returns {Cell}
   */
  setBackground(options = {}) {
    const {r = -1, g = -1, b = -1} = options;

    this._background.r = r;
    this._background.g = g;
    this._background.b = b;

    this.setModified();

    return this;
  }

  /**
   * Get current foreground color.
   *
   * @returns {{r: Number, g: Number, b: Number}}
   */
  getForeground() {
    return this._foreground;
  }

  /**
   * Set new foreground color.
   *
   * @param {Object} [options] Object with foreground color
   * @param {Number} [options.r=-1] Red channel
   * @param {Number} [options.g=-1] Green channel
   * @param {Number} [options.b=-1] Blue channel
   * @returns {Cell}
   */
  setForeground(options = {}) {
    const {r = -1, g = -1, b = -1} = options;

    this._foreground.r = r;
    this._foreground.g = g;
    this._foreground.b = b;

    this.setModified();

    return this;
  }

  /**
   * Get current display modes.
   *
   * @returns {{bold: Boolean, dim: Boolean, underlined: Boolean, blink: Boolean, reverse: Boolean, hidden: Boolean}}
   */
  getDisplay() {
    return this._display;
  }

  /**
   * Set new display modes to cell.
   *
   * @param {Object} [options] Object with display modes
   * @param {Boolean} [options.bold=false] Bold style
   * @param {Boolean} [options.dim=false] Dim style
   * @param {Boolean} [options.underlined=false] Underlined style
   * @param {Boolean} [options.blink=false] Blink style
   * @param {Boolean} [options.reverse=false] Reverse style
   * @param {Boolean} [options.hidden=false] Hidden style
   * @returns {Cell}
   */
  setDisplay(options = {}) {
    const {bold = false, dim = false, underlined = false, blink = false, reverse = false, hidden = false} = options;

    this._display.bold = bold;
    this._display.dim = dim;
    this._display.underlined = underlined;
    this._display.blink = blink;
    this._display.reverse = reverse;
    this._display.hidden = hidden;

    this.setModified();

    return this;
  }

  /**
   * Mark cell as modified or not.
   * It useful when you need to filter out only modified cells without building the diff.
   *
   * @param {Boolean} [isModified=true] Flag shows if cell is modified
   * @returns {Cell}
   */
  setModified(isModified = true) {
    this._modified = isModified;
    return this;
  }

  /**
   * Check if cell has been modified.
   *
   * @returns {Boolean}
   */
  isModified() {
    return !!this._modified;
  }

  /**
   * Reset display settings.
   * It resets char, background, foreground and display mode.
   *
   * @returns {Cell}
   */
  reset() {
    return this.setChar().setBackground().setForeground().setDisplay();
  }

  /**
   * Convert cell to ASCII control sequence.
   * Disables flag which marks cell as modified.
   *
   * @returns {String}
   */
  toString() {
    const [char, x, y, background, foreground, display] = [this.getChar(), this.getX(), this.getY(), this.getBackground(), this.getForeground(), this.getDisplay()];

    this.setModified(false);

    return (
      encodeToVT100(`[${y + 1};${x + 1}f`) +
      encodeToVT100(`[48;2;${background.r};${background.g};${background.b}m`) +
      encodeToVT100(`[38;2;${foreground.r};${foreground.g};${foreground.b}m`) +
      Object.keys(display).reduce((seq, key) => seq + (display[key] ? encodeToVT100(`[${DISPLAY_MODES[key.toUpperCase()]}m`) : ''), '') +
      char +
      encodeToVT100(`[${DISPLAY_MODES.RESET_ALL}m`)
    );
  }

  /**
   * Wrapper around `new Cell()`.
   *
   * @static
   * @returns {Cell}
   */
  static create(...args) {
    return new this(...args);
  }
}
