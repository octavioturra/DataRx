var http = require('http'),
    Rx = require('rx'),
    mongo = require('mongodb').MongoClient;

class Server extends http.Server {
  constructor(){
    http.Server.call(this);
  }
  requests(){
    return Rx
      .Node
      .fromEvent(
        this,
        'request',
        (args)=>{return {req:args[0], res:args[1]};}
      );
  }
}


var url = 'mongodb://localhost:27017/myproject';
var server = new Server();

var connect = () => rx.Observable.create((o) => mongo.connect(url), (err,db)=>{
  if(err){
    return o.onError(err);
  }
  return o.onNext(db);
}).publish().refCount();

var addItem = (db) => rx.Observable.create(
  (o) => db.collection.items.find().toArray(
    (err, d)=>{
      if(err){
        o.onError(err);
      } else {
        o.onNext(d);
        o.onCompleted();
      }
      return ()=> db.close();
    }
  )
);

console.log('loading'); 

var server = new Server();

server.requests().subscribe((s)=>s.res.end('teste'));

server.listen(1000);