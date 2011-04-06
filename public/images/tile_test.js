// Read a file from disk, store it in Redis, then read it back from Redis.

var redis = require("redis"),
    client = redis.createClient(), //6379, '127.0.0.1', {return_buffers: true}
    fs = require("fs"),
    filename = "ee260b2ec91142e4c76ebfb7bfab60d6";

// Get the file I use for testing like this:
//    curl http://ranney.com/kids_in_cart.jpg -o kids_in_cart.jpg
// or just use your own file.

// Read a file from fs, store it in Redis, get it back from Redis, write it back to fs.

client.get(filename, function (err, reply) { // get entire file
    if (err) {
        console.log("Get error: " + err);
    } else {
        fs.writeFile("duplicate_" + filename + ".png", reply, function (err) {
            if (err) {
                console.log("Error on write: " + err)
            } else {
                console.log("File written.");
            }
            client.end();
        });
    }
});
