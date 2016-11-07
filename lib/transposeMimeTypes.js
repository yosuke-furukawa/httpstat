'use strict';

const mimeTypeMap = require('../data/mime-types.json');

module.exports = function transpose(map) {
  if (!map) {
    map = mimeTypeMap;
  }
  const types = {};
  for (const key in map) {
    if (map.hasOwnProperty(key)) {
      map[key].forEach((ext) => {
        types[ext] = key;
      });
    }
  }
  return types;
};