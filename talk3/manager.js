var R = require('ramda');
var Future = require('ramda-fantasy').Future;
var RSMQWorker = require("rsmq-worker");

worker = new RSMQWorker("myqueue", {
    autostart: false
});

worker.on("ready", function() {
    worker.send("gummy2");
});
