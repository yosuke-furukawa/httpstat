#!/usr/bin/env node

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const opts = require('./opts')(argv);

const pack = require('../package.json');
const main = require('../');
const reporter = require('../lib/reporter');

const showHelp = () => {
  console.log(`
    ${pack.description}
    Usage: httpstat [options...] <url>
    options:
      -X, --method http method default GET
      -H, --header request header
      -d, --data request body
      -F, --form Specify HTTP multipart POST data
      -k, --insecure Allow connections to SSL sites without certs
      --show-body Show response body
  `);
  process.exit(0);
};

if (opts.help || !opts.target) {
  showHelp();
}

if (opts.version) {
  console.log(pack.version);
  process.exit(0);
}

main(opts.target, opts.options, opts.headers, opts.data).then(
  (results) => reporter(results, opts)
).catch(console.error);
