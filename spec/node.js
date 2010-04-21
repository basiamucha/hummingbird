
require.paths.unshift('spec', '/usr/local/Cellar/ruby-enterprise-edition/2009.10/lib/ruby/gems/1.8/gems/jspec-4.2.1/lib', 'lib')
require.paths.unshift(__dirname + '/../lib');
require.paths.unshift(__dirname + '/..');

require('jspec')
require('unit/spec.helper')
hb = require('hummingbird')
http = require('http');
v = require('view');
sys = require('sys');

MockRequest = function(url) {
  this.url = url;
}

MockResponse = function() {
  this.data = null;
  this.headers = null;
  this.statusCode = null;
  this.state = "open";
};

MockResponse.prototype = {
  writeHead: function(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = headers;
  },

  write: function(data, dataType) {
    this.data = data;
    this.dataType = dataType;
  },

  close: function() { this.end(); },

  end: function() {
    this.state = "closed";
  }
};

MockCollection = function() {
  this.inserts = [];
}

MockCollection.prototype = {
  insert: function(data) {
    this.inserts.push(data)
  }
}

JSpec
  .exec('spec/unit/hummingbird_spec.js')
  .exec('spec/unit/view_spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()