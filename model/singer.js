const conn = require('../conn');
let async = require('async');
let asyncRes = require('./asyncRes');

exports.all = function (req, callback) {
    let query = 'select * from `qcmusic_singers`';
    conn.query(query, asyncRes(callback));
};

exports.get = function (req, callback) {
    let query = 'select * from `qcmusic_singers` where sid = ?';
    conn.query(query, req.params.sid, asyncRes(callback));
};

exports.create = function (req, callback) {
    let query = 'insert into `qcmusic_singers` (name, summary) values (?, ?)';
    conn.query(query, [
        req.body.name,
        req.body.summary,
    ], asyncRes(callback));
};

exports.update = function (req, callback) {
    let query = 'update `qcmusic_singers` set name=?, summary=? where sid=?';
    conn.query(query, [
        req.body.name,
        req.body.summary,
        req.body.sid
    ], asyncRes(callback));
};

exports.delete = function (req, callback) {
    let sid = req.body.sid;
    async.waterfall([
        function(callback) {
            let query = 'select * from `qcmusic_audio_singer` where sid = ?';
            conn.query(query, sid, function(err, result) {
                callback(err, result);
            });
        },
        function(rows, callback) {
            if (rows.length === 0) {
                let query = 'delete from `qcmusic_singers` where sid=?';
                conn.query(query, sid, function(err, result) {
                    callback(err, result);
                });
            } else {
                callback('error: 存在关联记录无法删除');
            }

        },
    ], asyncRes(callback));
};