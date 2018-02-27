const conn = require('../conn');
let async = require('async');
let asyncRes = require('./asyncRes');

exports.all = function (req, callback) {
    let query = 'select * from `qcmusic_discs`';
    conn.query(query, asyncRes(callback));
};

exports.get = function (req, callback) {
    let query = 'select * from `qcmusic_discs` where did = ?';
    conn.query(query, req.params.did, asyncRes(callback));
};

exports.create = function (req, callback) {
    let query = 'insert into `qcmusic_discs` (title, sid, release_time, summary, img, count) values (?,?,?,?,?,0)';
    conn.query(query, [
        req.body.title,
        req.body.sid,
        req.body.release_time,
        req.body.summary,
        req.body.img,
    ], asyncRes(callback));
};

exports.update = function (req, callback) {
    let query = 'update `qcmusic_discs` set title=?, sid=?, release_time=?, summary=?, img=?, count=? where did=?';
    conn.query(query, [
        req.body.title,
        req.body.sid,
        req.body.release_time,
        req.body.summary,
        req.body.img,
        req.body.count,
        req.body.did,
    ], asyncRes(callback));
};

exports.delete = function (req, callback) {
    let did = req.body.did;
    async.waterfall([
        function(callback) {
            let query = 'select * from `qcmusic_audios` where did = ?';
            conn.query(query, did, function(err, result) {
                callback(err, result);
            });
        },
        function(rows, callback) {
            console.log(rows)
            if (rows.length === 0) {

                let query = 'delete from `qcmusic_discs` where did=?';
                conn.query(query, did, function(err, result) {
                    callback(err, result);
                });
            } else {
                callback('error: 存在关联记录无法删除');
            }

        },
    ], asyncRes(callback));
};
