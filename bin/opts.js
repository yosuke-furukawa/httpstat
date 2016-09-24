'use strict';

const opts = (argv) => {
  const method = argv.method || argv.X || 'GET';
  const data = argv.data || argv.d;
  const header = argv.header || argv.H;
  const insecure = argv.insecure || argv.k;
  const help = argv.help || argv.h;
  const version = argv.version || argv.v;
  const target = argv._[0];

  const headers = 
    Array.isArray(header) ? header : 
    header ? [header] : null;

  return {
    options: {
      method: method,
      rejectUnauthorized: !insecure,
    },
    help: help,
    version: version,
    target: target,
    data: data,
    headers: headers
  };

};

module.exports = opts;
