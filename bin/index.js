#!/usr/bin/env node

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const opts = require('./opts')(argv);

const pack = require('../package.json');
const main = require('../');

function showHelp() {
  console.log(`
    ${pack.description}
    Usage: httpstat [options...] <url>
    options:
      -X, --method http method default GET
      -H, --header request header
      -d, --data request body
      -k, --insecure Allow connections to SSL sites without certs
  `);
  process.exit(0);
}

if (opts.help) {
  showHelp();
}

if (opts.version) {
  console.log(pack.version);
  process.exit(0);
}

main(opts.target, opts.options, opts.headers, opts.data);
