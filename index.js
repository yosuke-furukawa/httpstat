const http = require('http');
const https = require('https');
const util = require('util');
const colors = require('util').inspect.colors;
const parse = require('url').parse;
const sprintf = require('sprintf');


const HTTPS_TEMPLATE = `` +
		`  DNS Lookup   TCP Connection   SSL Handshake   Server Processing   Content Transfer` + "\n"+
		`[ %s  |     %s  |        %s  |       %s  |         %s  ]` + "\n" +
		`             |                |                   |                  |                    |` + "\n" +
		`    namelookup:%s      |                   |                  |                    |` + "\n"+
		`                        connect:%s         |                  |                    |` + "\n"+
		`                                    pretransfer:%s            |                    |` + "\n"+
		`                                                      starttransfer:%s             |` + "\n"+
		`                                                                                 total:%s` + "\n";

const HTTP_TEMPLATE = `` +
		`   DNS Lookup   TCP Connection   Server Processing   Content Transfer` + "\n" +
		`[ %s  |     %s  |        %s  |       %s  ]` + "\n" +
		`             |                |                   |                  |` + "\n" +
		`    namelookup:%s      |                   |                  |` + "\n" +
		`                        connect:%s         |                  |` + "\n" +
		`                                      starttransfer:%s        |` + "\n" +
		`                                                                 total:%s` + "\n";

function colorize(str, color) {
  return '\u001b[' + color[0] + 'm' + str + '\u001b[' + color[1] + 'm';
}

function fmta(duration) {
  return colorize(sprintf("%7dms", duration), colors.cyan);
};

function fmtb(duration) {
  return colorize(sprintf("%-9s", duration + 'ms'), colors.cyan);
};

module.exports = function main(arg, opts) {
  const url = Object.assign(parse(arg), opts);
  const protocol = url.protocol === 'https:' ? https : http;
  var begin = Date.now();
  var onLookup = 0; // diff begin - dns resolve
  var onConnect = 0; // diff dns resolve - connect
  var onSecureConnect = 0; // diff connect - secureConnect
  var onTransfer = 0; // diff connet - transfer
  var onTotal = 0; // diff begin - end
  url.method = 'GET';
  const req = protocol.request(url, (res) => {
    res.once('data', (chunk) => {
      onTransfer = Date.now();
    });
    res.on('end', () => {
      onTotal = Date.now();
      process.stdout.write(
        "\n%s%s%s\n", 
        url.protocol === 'https:' ? 
          colorize("HTTPS", colors.green) : colorize("HTTP", colors.green),
        colorize("/", colors.white), 
        sprintf("%s %s", res.httpVersion, res.statusCode)
      );

      Object.keys(res.headers).forEach((key) => {
        console.log(
          colorize(key + ":", colors.white), 
          colorize(res.headers[key], colors.cyan)
        );
      });

      if (url.protocol === 'http:') {
         return (
          sprintf(
            HTTP_TEMPLATE, 
            fmta(onLookup - begin),
            fmta(onConnect - onLookup),
            fmta(onTransfer - onConnect),
            fmta(onTotal - onTransfer),
            fmtb(onLookup - begin),
            fmtb(onConnect - begin),
            fmtb(onTransfer - begin),
            fmtb(onTotal - begin)
          )
        );
      } else if (url.protocol === 'https:') {
        return (
          sprintf(
            HTTPS_TEMPLATE, 
            fmta(onLookup - begin),
            fmta(onConnect - onLookup),
            fmta(onSecureConnect - onConnect),
            fmta(onTransfer - onSecureConnect),
            fmta(onTotal - onTransfer),
            fmtb(onLookup - begin),
            fmtb(onConnect - begin),
            fmtb(onSecureConnect - begin),
            fmtb(onTransfer - begin),
            fmtb(onTotal - begin)
          )
        );
      }
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

  req.end();
}

