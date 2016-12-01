httpstat
========================================
[![Build Status](https://travis-ci.org/yosuke-furukawa/httpstat.svg?branch=master)](https://travis-ci.org/yosuke-furukawa/httpstat)

httpstat is a curl like tool, visualize http/https process and show the duration.

![image](https://github.com/yosuke-furukawa/httpstat/raw/master/screenshot.png)

Reference from [python httpstat](https://github.com/reorx/httpstat) and [go httpstat](https://github.com/davecheney/httpstat)

# Install as tool

```
$ npm install httpstat -g 
```

# Usage as tool

```
$ httpstat http://httpbin.org/get
$ httpstat -X POST -d test http://httpbin.org/post
```

# Install as library

```
$ npm install httpstat -S
```

# Usage as library

```javascript
const httpstat = require('httpstat');

httpstat('http://httpbin.org/post', { method: 'POST' }).then((result) => {
  console.log(result); // time property has duration time.
}).catch((e) => {
  console.error(e);
});
```

# API

## httpstat(url, [options]) - return Promise

- `url` (type: `string`, required): Request target url
- `options` (type: `object`, optional)
  - `method`: (type: `string`, default: `GET`): HTTP request method
  - `insecure`: (type: `boolean`): Allow connections to SSL sites without certs
  - `headers`: (type: `array` of `string`): Request headers
  - `data`: (type: `string`): Request body,
  - `formData`: (type: `array` of `string`):  HTTP multipart POST data

