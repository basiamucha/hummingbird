var http = require('http');
var url = require('url');
var dgram = require('dgram');
var Metric = require('./metric');
var pixel = require('./pixel');
var impressiondb = require('./mongodb').ImpressionProvider;
var impressionProvider = new ImpressionProvider(config.mongo_host, config.mongo_port, config.mongo_db);

var pixelHandler = function(req, res) {
  console.log(" - " + req.url);
  res.writeHead(200, pixel.headers);
  res.end(pixel.data);

  req.params = url.parse(req.url, true).query;
  console.log(" - " + req.params.ip);
  console.log(JSON.stringify(req.params));
  Metric.insert(req);

  impressionProvider.save({
        creative_id: req.params.CID,
        user_ip: req.params.IP,
        seg_ids: req.params.SEDS,
        seg_codes: req.params.SECS,
        cpg_code: req.params.CPG_CODE,
        cpg_id: req.params.CPG_ID,
        publisher_id: req.params.PID,
        geo_lat: req.params.LAT,
        geo_lon: req.params.LONG,
        ext_app_id: req.params.APP_ID,
        device_md5: req.params.MD5,
        device_sha1: req.params.SHA1,
        device_apple_ida: req.params.IDA
    }, function( error, docs) {
        if(error)
           console.log("Error on insert: " + JSON.stringify(error));
    });
};

exports.listen = function(server, address) {
  console.log("In tracker --- listener");

  if(typeof(server) === "number") {
    var port = server;
    http.createServer(pixelHandler).listen(port, address);
  } else {
    // Attach to an existing server
    var oldListeners = server.listeners('request');
    server.removeAllListeners('request');

    server.on('request', function(req, res) {
      if(req.url.match(/^\/tracking_pixel/)) {
        console.log("Request came in");
        pixelHandler(req, res);
      } else {
        for (var i = 0, l = oldListeners.length; i < l; i++) {
          oldListeners[i].call(server, req, res);
        }
      }
    });
  }
};


exports.listenUdp = function(port, address) {
  var server = dgram.createSocket("udp4");

  server.on("message", function (message, rinfo) {
    var data;
    try {
      data = JSON.parse(message.toString());
    } catch(e) {
      return console.log("Error parsing UDP message: " + e.message);
    }

    Metric.insert({ip: data.ip, params: data});
  });

  server.on("listening", function () {
    var address = server.address();
    console.log("Udp server listening " +
        address.address + ":" + address.port);
  });

  server.bind(port, address);

};
