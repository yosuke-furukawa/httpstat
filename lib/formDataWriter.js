'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const crlf = '\r\n';

const write = (request, inputs) => {
  const boundary = generateBoundary();
  const body = createRequestBody(inputs, boundary);
  setRequestHeaders(request, body, boundary);
  request.write(body);
};

const generateBoundary = () => {
  const token = crypto.randomBytes(16).toString('hex');
  const boundary = `---httpstat${token}`;
  return boundary;
};

const setRequestHeaders = (request, body, boundary) => {
  request.setHeader('Content-Type', 
      `multipart/form-data; boundary=${boundary}`);
  request.setHeader('Content-Length', body.length);
};

const createRequestBody = (inputs, boundary) => {
  let body = '';
  inputs.forEach((input) => {
    body += getDataForInput(input, boundary);
  });
  body += `${crlf}--${boundary}--`;
  return body;
};

const getDataForInput = (input, boundary) => {
  const item = input.split('=');
  const name = item[0].trim();
  const value = item[1];
  let part;
  if (value.startsWith('@')) {
    part = getDataForFileInput(name, value, boundary);
  } else {
    part = getDataForFormInput(name, value, boundary);
  }
  return part;
};

const getDataForFormInput = (name, value, boundary) => {
  const formDataItem = [
    crlf,
    `--${boundary}${crlf}`,
    `Content-Disposition: form-data; name="${name}"${crlf}`,
    `${crlf}${value}`,
  ];
  return formDataItem.join('');
};

const getDataForFileInput = (name, value, boundary) => {
  const filePath = value.substr(1);
  const fileData = fs.readFileSync(filePath);
  const transposeMimeTypes = require('./transposeMimeTypes');
  const types = transposeMimeTypes();
  const fileExtension = path.extname(filePath).substr(1);
  const matched = types[fileExtension] || 'text/plain';
  const formDataItem = [crlf,
    `--${boundary}${crlf}`,
    `Content-Disposition: form-data; name="${name}"; filename=${path.basename(filePath)}${crlf}`,
    `Content-Type: ${matched}${crlf}`,
    `${crlf}${fileData}`,
  ];
  return formDataItem.join('');
};

module.exports = write;