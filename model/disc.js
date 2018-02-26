let conn = require('../conn.js');
let asyncRes = require('./asyncRes');

exports.all = function (req, callback) {
    query = 'select * from `qcmusic_discs`';
    return conn.query(query, asyncRes(callback));
};

exports.get = function (req, callback) {
    query = 'select * from `qcmusic_discs` where did = ?';
    return conn.query(query, req.params.did, asyncRes(callback));
};
