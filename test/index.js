const test = require('eater/runner').test;
const http = require('http');
const https = require('https');
const fs = require('fs');
const httpstat = require('../');
const assert = require('assert');
const AssertStream = require('assert-stream');

test('index.js: request to http server', () => {
  const server = http.createServer((req, res) => {
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    httpstat(`http://localhost:${port}/`);
    setTimeout(() => {
      server.close();
    }, 1000);
  });
});

test('index.js: request to https server', () => {
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
    httpstat(`https://localhost:${port}/`, { rejectUnauthorized: false });
    setTimeout(() => {
      server.close();
    }, 1000);
  });
});

test('index.js: request with headers to http server', () => {
  const server = http.createServer((req, res) => {
    assert.strictEqual(req.method, 'POST');
    assert.strictEqual(req.headers['content-type'], 'application/json');
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    httpstat(`http://localhost:${port}/`, { method: 'POST' }, ["Content-Type: application/json"]);
    setTimeout(() => {
      server.close();
    }, 1000);
  });
});

test('index.js: request with headers with body to http server', () => {
  const server = http.createServer((req, res) => {
    assert.strictEqual(req.method, 'PUT');
    assert.strictEqual(req.headers['content-type'], 'application/json');
    const assertStream = new AssertStream();
    assertStream.expect("fooobarr");
    req.pipe(assertStream);
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    httpstat(`http://localhost:${port}/`, { method: 'PUT' }, ["Content-Type: application/json"], "fooobarr");
    setTimeout(() => {
      server.close();
    }, 1000);
  });
});
