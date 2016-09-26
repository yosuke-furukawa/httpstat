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
$ httpstat http://example.com/
$ httpstat -X POST -d test http://example.com/
```

# Install as library

```
$ npm install httpstat -S
```

# Usage as library

```javascript
const httpstat = require('httpstat');

httpstat('http://example.com', /* option, headers, body */).then((result) => {
  console.log(result); // time property has duration time.
}).catch((e) => {
  console.error(e);
});
```

# API

## httpstat(url, [options], [headers], [body]) - return Promise

- url, type: string, `url` is a request target url. required.
- options, type: object, `options` is a http(s) request options see [node http API](https://nodejs.org/docs/latest/api/http.html#http_http_request_options_callback)
- headers, type: array, headers is http request headers like ["Content-Type: application/json"]
- body, type: string, body is http request body

