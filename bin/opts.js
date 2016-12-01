'use strict';

const argToArray = (argv) => {
  return Array.isArray(argv) ? argv :
    argv ? [argv] : null;
};

const opts = (argv) => {
  const method = argv.method || argv.X || 'GET';
  const data = argv.data || argv.d;
  const form = argv.form || argv.F;
  const header = argv.header || argv.H;
  const insecure = argv.insecure || argv.k;
  const help = argv.help || argv.h;
  const version = argv.version || argv.v;
  const showBody = argv['show-body'];
  const target = argv._[0];

  const headers = argToArray(header);
  const formData = argToArray(form);

  return {
    method,
    insecure,
    help: help,
    version: version,
    showBody: showBody,
    target: target,
    data: data,
    formData: formData,
    headers: headers
  };
};

module.exports = opts;
