var RSMQWorker = require("rsmq-worker");

worker = new RSMQWorker("myqueue", {
    interval: .1
});

worker.on("message", function(msg, next, id) {
    console.log("RECEIVED", msg,id);
    next();
});

worker.start();
