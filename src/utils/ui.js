const colors = require('./colors');

const ui = {
  progressBar: (current, total, width = 40) => {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((width * current) / total);
    const empty = Math.max(0, width - filled);
    let bar;
    if (filled === 0) {
      bar = '━'.repeat(width);
    } else if (filled === width) {
      bar = '━'.repeat(width);
    } else {
      bar = '━'.repeat(filled) + '╸' + '━'.repeat(Math.max(0, empty - 1));
    }
    return `[${colors.accent(bar)}] ${colors.dim(`${percentage}%`)}`;
  },

  status: {
    info: () => colors.info('●'),
    success: () => colors.success('✓'),
    warning: () => colors.warning('▲'),
    error: () => colors.error('✗'),
    pending: () => colors.dim('○'),
    bullet: () => colors.muted('•')
  },

  subheader: (text) => `\n${colors.secondary('▎')} ${colors.bold(text)}`
};

module.exports = ui;
