const { exec, spawn } = require('child_process');

const run = (command, opts = {}) =>
  new Promise(resolve => {
    exec(command, { cwd: opts.cwd }, (err, stdout, stderr) => {
      resolve({
        ok: !err,
        stdout: (stdout || '').toString(),
        stderr: (stderr || '').toString(),
        code: err && err.code != null ? err.code : err ? 1 : 0,
      });
    });
  });

const which = async binary => {
  const res = await run(`command -v ${binary}`);
  return res.ok && res.stdout.trim().length > 0;
};

const spawnInherit = (command, args, options = {}) =>
  new Promise(resolve => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('exit', code => resolve(code == null ? 1 : code));
  });

module.exports = { run, which, spawnInherit };
