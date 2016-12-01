'use strict';

const http = require('http');
const https = require('https');
const parse = require('url').parse;
const writeFormData = require('./lib/formDataWriter');

module.exports = function main(target, options) {
  options = options || {};
  const httpOptions = {
    method: options.method,
    rejectUnauthorized: !options.insecure,
  };
  const url = Object.assign(parse(target), httpOptions);
  return new Promise((resolve, reject) => {
    const protocol = url.protocol === 'https:' ? https : http;
    var begin = Date.now();
    var onLookup = begin; // diff begin - dns resolve
    var onConnect = begin; // diff dns resolve - connect
    var onSecureConnect = begin; // diff connect - secureConnect
    var onTransfer = begin; // diff connect - transfer
    var onTotal = begin; // diff begin - end
    var body = '';
    const req = protocol.request(url, (res) => {
      res.once('readable', () => {
        onTransfer = Date.now();
      });
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        onTotal = Date.now();
        res.body = body;
        resolve({
          url: url,
          response: res,
          time: {
            begin: begin,
            onLookup: onLookup,
            onConnect: onConnect,
            onSecureConnect: onSecureConnect,
            onTransfer: onTransfer,
            onTotal: onTotal,
          }
        });
      });
    });
    req.on('socket', (socket) => {
      socket.on('lookup', () => {
        onLookup = Date.now();
      });
      socket.on('secureConnect', () => {
        onSecureConnect = Date.now();
      });
      socket.on('connect', () => {
        onConnect = Date.now();
      });
    });

    req.on('error', reject);

    if (options.headers) {
      options.headers.forEach((header) => {
        const entries = header.split(':');
        const name = entries[0].trim();
        const value = entries[1].trim();
        req.setHeader(name, value);
      });
    }

    if(options.formData) {
      writeFormData(req, options.formData);
    }

    if (options.data) {
      req.write(options.data);
    }

    req.end();
  });
}

