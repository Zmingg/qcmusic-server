let express = require('express');
let app = express();

let server = app.listen(3000, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://192.168.1.25:8725");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",'QcMusic');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

let router = require('./router');
router(app);