const test = require('eater/runner').test;
const http = require('http');
const https = require('https');
const fs = require('fs');
const mustCall = require('must-call');
const httpstat = require('../');
const assert = require('assert');
const AssertStream = require('assert-stream');
const urlFormat = require('url').format;

test('index.js: request to http server', () => {
  const server = http.createServer((req, res) => {
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    const requestUrl = `http://localhost:${port}/`;
    httpstat(requestUrl).then(mustCall((results) => {
      const time = results.time;
      const res = results.response;
      const url = results.url;
      assert.equal(urlFormat(url), requestUrl);
      assert(time.begin > 0);
      assert(time.onLookup >= time.begin);
      assert(time.onConnect >= time.begin);
      assert(time.onTransfer >= time.begin);
      assert(time.onTotal >= time.begin);
      assert.strictEqual(res.body, 'hello');
      server.close();
    }));
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
    const requestUrl = `https://localhost:${port}/`;
    httpstat(requestUrl, { rejectUnauthorized: false }).then(mustCall((results) => {
      const time = results.time;
      const res = results.response;
      const url = results.url;
      assert.equal(urlFormat(url), requestUrl);
      assert(time.begin > 0);
      assert(time.onLookup >= time.begin);
      assert(time.onConnect >= time.begin);
      assert(time.onSecureConnect >= time.begin);
      assert(time.onTransfer >= time.begin);
      assert(time.onTotal >= time.begin);
      assert.strictEqual(res.body, 'hello');
      server.close();
    }));
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
    const requestUrl = `http://localhost:${port}/`;
    httpstat(
      requestUrl, 
      { method: 'POST' }, 
      ["Content-Type: application/json"]
    ).then((results) => {
      server.close();
    });
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
    const requestUrl = `http://localhost:${port}/`;
    httpstat(
      requestUrl, 
      { method: 'PUT' }, 
      ["Content-Type: application/json"], 
      "fooobarr"
    ).then((results) => {
      server.close();
    });
  });
});

test('index.js: request to http server use IP', () => {
  const server = http.createServer((req, res) => {
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    const requestUrl = `http://127.0.0.1:${port}/`;
    httpstat(requestUrl).then((results) => {
      const time = results.time;
      const res = results.response;
      const url = results.url;
      assert.equal(urlFormat(url), requestUrl);
      assert(time.begin > 0);
      assert(time.onLookup === time.begin);
      assert(time.onConnect >= time.begin);
      assert(time.onTransfer >= time.begin);
      assert(time.onTotal >= time.begin);
      assert.strictEqual(res.body, 'hello');
      server.close();
    });
  });
});
