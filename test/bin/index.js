'use strict';

const test = require('eater/runner').test;
const http = require('http');
const https = require('https');
const fs = require('fs');
const exec = require('child_process').exec;
const assert = require('assert');
const mustCall = require('must-call');

test('bin/index: help', (_, fail) => {
  exec(`node ${process.cwd()}/bin/index.js --help`, mustCall((err, result) => {
    if (err) fail(err);
    assert(result.match(/Usage:/));
  }));
});

test('bin/index: version', (_, fail) => {
  exec(`node ${process.cwd()}/bin/index.js --version`, mustCall((err, result) => {
    if (err) fail(err);
    const version = require(`${process.cwd()}/package.json`).version;
    assert.strictEqual(result.trim(), version);
  }));
});

test('bin/index: http request', (_, fail) => {
  const server = http.createServer((req, res) => {
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    exec(`node ${process.cwd()}/bin/index.js http://localhost:${port}`, mustCall((err, result) => {
      if (err) fail(err);
      assert(result.match(/DNS Lookup/));
      assert(result.match(/TCP Connection/));
      assert(result.match(/Server Processing/));
      assert(result.match(/Content Transfer/));
      server.close();
    }));
  });
});

test('bin/index: https request', (_, fail) => {
  const options = {
    key: fs.readFileSync('test/keys/agent1-key.pem'),
    cert: fs.readFileSync('test/keys/agent1-cert.pem')
  };
  const server =  https.createServer(options, (req, res) => {
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    exec(`node ${process.cwd()}/bin/index.js https://localhost:${port} --insecure`, mustCall((err, result) => {
      if (err) fail(err);
      assert(result.match(/DNS Lookup/));
      assert(result.match(/TCP Connection/));
      assert(result.match(/SSL Handshake/));
      assert(result.match(/Server Processing/));
      assert(result.match(/Content Transfer/));
      server.close();
    }));
  });
});

test('bin/index: showBody', (_, fail) => {
  const server =  http.createServer((req, res) => {
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    exec(`node ${process.cwd()}/bin/index.js --show-body http://localhost:${port}`, mustCall((err, result) => {
      if (err) fail(err);
      assert(result.match(/DNS Lookup/));
      assert(result.match(/TCP Connection/));
      assert(result.match(/Server Processing/));
      assert(result.match(/Content Transfer/));
      assert(result.match(/hello/));
      server.close();
    }));
  });
});
