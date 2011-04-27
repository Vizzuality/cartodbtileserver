var Tyler = require('tyler')
  , assert = require('assert')
  , _ = require('underscore')
  , redis_pool = Tyler.RedisPool;

exports['test truth'] = function(){
    assert.ok(true,  'it is');
};

exports['test can instantiate a RedisPool object'] = function(){
  assert.ok(redis_pool);
}

exports['test pool object has an aquire function'] = function(){
  assert.includes(_.functions(redis_pool), 'acquire');
}

exports['test calling aquire returns a redis client object that can get/set'] = function(beforeExit){
  redis_pool.acquire(0, function(client){
    client.set("key","value")
    client.get("key", function(err,data){      
      assert.eql(data, "value");      
      redis_pool.release(0, client); // needed to exit tests
    })
  });    
}

exports['test calling aquire on another DB returns a redis client object that can get/set'] = function(beforeExit){
  redis_pool.acquire("MYDATABASE", function(client){
    client.set("key","value")
    client.get("key", function(err,data){      
      assert.eql(data, "value");      
      redis_pool.release("MYDATABASE", client); // needed to exit tests
    })
  });    
  
  redis_pool.acquire("MYDATABASE", function(client){
    client.get("key", function(err,data){      
      assert.eql(data, "value");      
      redis_pool.release("MYDATABASE", client); // needed to exit tests
    })
  });      
}