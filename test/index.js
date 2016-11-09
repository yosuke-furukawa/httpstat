'use strict';

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

test('index.js: request with multipart content to http server', () => {
  const server = http.createServer((req, res) => {
    assert.strictEqual(req.method, 'POST');
    const multipartHeader = 'multipart/form-data';
    assert.strictEqual(req.headers['content-type'].substr(0, multipartHeader.length), multipartHeader);
    let body = '';
    req.on('data', (data) => {
      body += data.toString();
    }).on('end', () => {
      const contentLength = parseInt(req.headers['content-length'], 10);
      if (isNaN(contentLength)) fail();
      assert.strictEqual(contentLength, body.length);
    });
    
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    const requestUrl = `http://localhost:${port}/`;
    httpstat(
      requestUrl, 
      { method: 'POST' }, 
      null, null, 
      ["foo=bar"]
    ).then((results) => {
      server.close();
    });
  });
});

test('index.js: request with multipart upload to http server', (_, fail) => {
  const server = http.createServer((req, res) => {
    assert.strictEqual(req.method, 'POST');
    const multipartHeader = 'multipart/form-data';
    assert.strictEqual(req.headers['content-type'].substr(0, multipartHeader.length), multipartHeader);
    let body = '';
    req.on('data', (data) => {
      body += data.toString();
    }).on('end', () => {
      const contentLength = parseInt(req.headers['content-length'], 10);
      if (isNaN(contentLength)) fail();
      assert.strictEqual(contentLength, body.length);
      assert(body.match(/Content-Type: application\/json/));
      const sampleData = fs.readFileSync('test/data/sample.json');
      assert.notEqual(body.indexOf(sampleData), -1);
    });
    
    res.end('hello');
  });
  server.listen(0);
  server.on('listening', () => {
    const port = server.address().port;
    const requestUrl = `http://localhost:${port}/`;
    httpstat(
      requestUrl, 
      { method: 'POST' }, 
      null, null, 
      ["foo=@test/data/sample.json"]
    ).then((results) => {
      server.close();
    });
  });
});

test('index.js: request with invalid file upload to http server', (_, fail) => {
  const requestUrl = `http://localhost/`;
  httpstat(
    requestUrl, 
    { method: 'POST' }, 
    null, null, 
    ["foo=@test/data/does-not-exist.json"]
  ).then(fail, mustCall((err) => {
    assert(err); 
    assert.equal(err.code, 'ENOENT');
    assert.equal(err.path, 'test/data/does-not-exist.json');
  }));
});
