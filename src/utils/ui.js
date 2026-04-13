const colors = require('./colors');

const ui = {
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
