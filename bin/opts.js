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
  const jsonOutput = argv['json-output'];
  const target = argv._[0];

  const headers = argToArray(header);
  const formInputs = argToArray(form);

  return {
    options: {
      method: method,
      rejectUnauthorized: !insecure,
    },
    help: help,
    version: version,
    showBody: showBody,
    jsonOutput: jsonOutput,
    target: target,
    data: data,
    formInputs: formInputs,
    headers: headers
  };
};

module.exports = opts;
