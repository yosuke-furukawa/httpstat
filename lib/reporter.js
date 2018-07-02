const sprintf = require('sprintf');
const colors = require('util').inspect.colors;

const HTTPS_TEMPLATE = `` +
		`  DNS Lookup   TCP Connection   SSL Handshake   Server Processing   Content Transfer` + "\n"+
		`[ %s  |     %s  |        %s  |       %s  |         %s  ]` + "\n" +
		`             |                |                   |                  |                    |` + "\n" +
		`    namelookup:%s      |                   |                  |                    |` + "\n"+
		`                        connect:%s         |                  |                    |` + "\n"+
		`                                    pretransfer:%s            |                    |` + "\n"+
		`                                                      starttransfer:%s             |` + "\n"+
		`                                                                                 total:%s` + "\n";

const HTTPS_TEMPLATE_JSON =
        `{"dns_lookup" : "%s" ,"tcp_connection" : "%s", "ssl_handshake" : "%s", ` +
        `"server_processing" : "%s", "content_transfer" : "%s", "name_lookup" : "%s",` +
        `"connect" : "%s", "pre_transfer": "%s", "start_transfer" : "%s", "total" : "%s"}`;

const HTTP_TEMPLATE = `` +
		`   DNS Lookup   TCP Connection   Server Processing   Content Transfer` + "\n" +
		`[ %s  |     %s  |        %s  |       %s  ]` + "\n" +
		`             |                |                   |                  |` + "\n" +
		`    namelookup:%s      |                   |                  |` + "\n" +
		`                        connect:%s         |                  |` + "\n" +
		`                                      starttransfer:%s        |` + "\n" +
		`                                                                 total:%s` + "\n";

const HTTP_TEMPLATE_JSON =
    `{"dns_lookup" : "%s" ,"tcp_connection" : "%s", ` +
    `"server_processing" : "%s", "content_transfer" : "%s", "name_lookup" : "%s",` +
    `"connect" : "%s", "start_transfer" : "%s", "total" : "%s"}`;

function colorize(str, color) {
  return '\u001b[' + color[0] + 'm' + str + '\u001b[' + color[1] + 'm';
}

function fmta(duration) {
  return colorize(sprintf("%7dms", duration), colors.cyan);
};

function fmtb(duration) {
  return colorize(sprintf("%-9s", duration + 'ms'), colors.cyan);
};

module.exports = (results, options) => {
  const url = results.url;
  const res = results.response;
  const time = results.time;

  process.stdout.write(sprintf(
    "\n%s%s%s\n", 
    url.protocol === 'https:' ? 
      colorize("HTTPS", colors.green) : colorize("HTTP", colors.green),
    colorize("/", colors.white), 
    sprintf("%s %s", res.httpVersion, res.statusCode)
  ));

  Object.keys(res.headers).forEach((key) => {
    console.log(
      colorize(key + ":", colors.white), 
      colorize(res.headers[key], colors.cyan)
    );
  });

  if (options.showBody) {
    console.log();
    console.log(res.body);
  }

  fmta = options.jsonOutput ? (d) => d : fmta;
  fmtb = options.jsonOutput ? (d) => d : fmtb;

  if (url.protocol === 'http:') {
     console.log(
      sprintf(
        options.jsonOutput ? HTTP_TEMPLATE_JSON : HTTP_TEMPLATE,
        fmta(time.onLookup - time.begin),
        fmta(time.onConnect - time.onLookup),
        fmta(time.onTransfer - time.onConnect),
        fmta(time.onTotal - time.onTransfer),
        fmtb(time.onLookup - time.begin),
        fmtb(time.onConnect - time.begin),
        fmtb(time.onTransfer - time.begin),
        fmtb(time.onTotal - time.begin)
      )
    );
  } else if (url.protocol === 'https:') {
     console.log(
      sprintf(
        options.jsonOutput ? HTTPS_TEMPLATE_JSON : HTTPS_TEMPLATE,
        fmta(time.onLookup - time.begin),
        fmta(time.onConnect - time.onLookup),
        fmta(time.onSecureConnect - time.onConnect),
        fmta(time.onTransfer - time.onSecureConnect),
        fmta(time.onTotal - time.onTransfer),
        fmtb(time.onLookup - time.begin),
        fmtb(time.onConnect - time.begin),
        fmtb(time.onSecureConnect - time.begin),
        fmtb(time.onTransfer - time.begin),
        fmtb(time.onTotal - time.begin)
      )
    );
  }
};
