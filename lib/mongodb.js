var MongoClient = require('mongodb').MongoClient;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ImpressionProvider = function(host, port, db) {
  console.log("Connecting to: " + db);
  if( host == undefined )
     host = config.host;
  var server = new Server(host, port, {safe: false,  poolSize: 50, auto_reconnect: true, native_parser:true});
  var client = new MongoClient(server);
  this.db = client.db(db);
  client.open(function(error, client){
     this.db = client.db(db);
  });
  console.log("Connection established: " + db);
};


ImpressionProvider.prototype.getCollection= function(callback) {
  this.db.collection('impressions-appnexus', function(error, impression_collection) {
    if( error ) callback(error);
    else callback(null, impression_collection);
  });
};

//find all impressions
ImpressionProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, impression_collection) {
      if( error ) callback(error)
      else {
        impression_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//save new impression
ImpressionProvider.prototype.save = function(impressions, callback) {
    this.getCollection(function(error, impression_collection) {
      if( error ) {
        callback(error);
        console.log(" Get Collection failed ");
      }
      else {
        if( typeof(impressions.length)=="undefined")
          impressions = [impressions];

        for( var i =0;i< impressions.length;i++ ) {
          impression = impressions[i];
          impression.created_at = new Date();
        }

        impression_collection.insert(impressions, function(error, doc) {
          if(error){
            console.log("Insert ERROR!!!!!: "+ +JSON.stringify(error));
           }
          callback(null, impressions);
        });
      }
    });
};

exports.ImpressionProvider = ImpressionProvider;