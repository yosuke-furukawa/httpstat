'use strict';

const http = require('http');
const https = require('https');
const parse = require('url').parse;
const writeFormData = require('./lib/formDataWriter');

module.exports = function main(arg, opts, headers, data, formInputs) {
  const url = Object.assign(parse(arg), opts);
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
      res.on('readable', () => {
        if (onTransfer === begin) {
          onTransfer = Date.now();
        }
        body += res.read();
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

    if (headers) {
      headers.forEach((header) => {
        const entries = header.split(':');
        const name = entries[0].trim();
        const value = entries[1].trim();
        req.setHeader(name, value);
      });
    }

    if(formInputs) {
      writeFormData(req, formInputs);
    }

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

