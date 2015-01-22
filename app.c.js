"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var http = require("http"),
    Rx = require("rx"),
    mongo = require("mongodb").MongoClient;

var Server = (function (_http$Server) {
  function Server() {
    http.Server.call(this);
  }

  _inherits(Server, _http$Server);

  _prototypeProperties(Server, null, {
    requests: {
      value: function requests() {
        return Rx.Node.fromEvent(this, "request", function (args) {
          return { req: args[0], res: args[1] };
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Server;
})(http.Server);




var url = "mongodb://localhost:27017/myproject";
var server = new Server();

var connect = function () {
  return rx.Observable.create(function (o) {
    return mongo.connect(url);
  }, function (err, db) {
    if (err) {
      return o.onError(err);
    }
    return o.onNext(db);
  }).publish().refCount();
};

var addItem = function (db) {
  return rx.Observable.create(function (o) {
    return db.collection.items.find().toArray(function (err, d) {
      if (err) {
        o.onError(err);
      } else {
        o.onNext(d);
        o.onCompleted();
      }
      return function () {
        return db.close();
      };
    });
  });
};

console.log("loading");

var server = new Server();

server.requests().subscribe(function (s) {
  return s.res.end("teste");
});

server.listen(1000);
