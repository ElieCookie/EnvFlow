const color = (code) => (text) => `\x1b[38;5;${code}m${text}\x1b[0m`;

const colors = {
  primary: color(110),
  secondary: color(103),
  accent: color(73),

  success: color(71),
  warning: color(136),
  error: color(167),
  info: color(74),

  text: color(252),
  dim: color(242),
  muted: color(238),

  red: color(167),

  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

module.exports = colors;
