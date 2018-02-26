const conn = require('../conn');
const async = require('async');
let asyncRes = require('./asyncRes');

exports.all = function (req, callback) {
    let query = 'select * from `qcmusic_singers`';
    conn.query(query, asyncRes(callback));
};