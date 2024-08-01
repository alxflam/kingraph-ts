import DEFAULT_STYLES from './defaults/styles.js';

/**
 * Returns attributes for a given class
 *
 *     data = { styles: { ':root': { color: 'gold', dir: 'none' } } }
 *     applyStyle(data, [':root'])
 *     => ['color="gold"', 'dir="none"']
 */
export default function applyStyle(data: { styles?: Record<string, object> }, classes: string[], options?: { before?: object; after?: object }) {
  if (!options) options = {};

  function applyStyles(acc: object, stylesheet: Record<string, object>) {
    return Object.keys(stylesheet).reduce((styles, key) => {
      if (classes.indexOf(key) === -1) return styles;
      return Object.assign({}, styles, stylesheet[key]);
    }, acc);
  }
  let result: object = {};
  result = Object.assign({}, result, options.before || {});
  result = applyStyles(result, DEFAULT_STYLES);
  result = applyStyles(result, data.styles || {});
  result = Object.assign({}, result, options.after || {});
  return renderStyle(result);
}

/**
 * Renders key/value into an attribute string
 *
 *     renderStyle({ color: 'gold', dir: 'none' ])
 *     => ['color="gold"', 'dir="none"']
 */
function renderStyle(properties: object) {
  return Object.entries(properties)
    .map(([key, val]) => {
      if (val == null) return null;
      return `${key}=${stringify(val)}`;
    })
    .filter((s) => s != null);
}

function stringify(val: string | object) {
  if (typeof val === 'string' && /^<.*>$/.test(val)) {
    return val;
  } else {
    return JSON.stringify(val);
  }
}
