const express = require('express');
const app = express();
const searchHandler = require('./searchHandler2');

app.get('/', function(req, res) {
    searchHandler(req.query)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.send(r)
        )
});

//app.listen(PORT || 8080, () => console.log(`Server listening on port ${PORT}`))

module.exports = app;
