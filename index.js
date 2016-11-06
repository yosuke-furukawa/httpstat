'use strict';

const http = require('http');
const https = require('https');
const parse = require('url').parse;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = function main(arg, opts, headers, data, formInputs) {
  const url = Object.assign(parse(arg), opts);
  return new Promise((resolve, reject) => {
    const protocol = url.protocol === 'https:' ? https : http;
    var begin = Date.now();
    var onLookup = begin; // diff begin - dns resolve
    var onConnect = begin; // diff dns resolve - connect
    var onSecureConnect = begin; // diff connect - secureConnect
    var onTransfer = begin; // diff connet - transfer
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

    if (headers) {
      headers.forEach((header) => {
        const entries = header.split(':');
        const name = entries[0].trim();
        const value = entries[1].trim();
        req.setHeader(name, value);
      });
    }

    if (formInputs) {
      const crlf = '\r\n';
      const token = crypto.randomBytes(16).toString('hex');
      const boundary = `---httpstat${token}`;
      req.setHeader('Content-Type', 
        `multipart/form-data; boundary=${boundary}`);
        
      let body = '';
      formInputs.forEach((input) => {
        let filename;
        let contentType = '';
        const item = input.split('=');
        const name = item[0].trim();
        let value = item[1];
        if (value.startsWith('@')) {
          const filePath = value.substr(1);
          try {
            value = fs.readFileSync(filePath);
            filename = `; filename=${path.basename(filePath)}`;
          } catch (err) {
            reject(err);
          }
          const transposeMimeTypes = require('./transposeMimeTypes');
          const types = transposeMimeTypes();
          const type = path.extname(filePath).substr(1);
          const matched = types[type] || 'text/plain';
          contentType = `Content-Type: ${matched}${crlf}`;
        }
        const formDataItem = [
          crlf,
          `--${boundary}${crlf}`,
          `Content-Disposition: form-data; name="${name}"${filename}${crlf}`,
          contentType,
          `${crlf}${value}`,
        ];
        body += formDataItem.join('');
      });
      body += `${crlf}--${boundary}--`;
      req.setHeader('Content-Length', body.length);
      req.write(body);
    }

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

