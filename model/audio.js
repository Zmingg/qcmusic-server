const conn = require('../conn');
const async = require('async');
let asyncRes = require('./asyncRes');
const api = require('../api/qiniu');

exports.all = function (req, callback) {
    let query = 'select * from `qcmusic_audios`';
    conn.query(query, asyncRes(callback));
};

exports.get = function (req, callback) {
    async.waterfall([
        function (callback) {
            let query = 'select a.*,t_s.*,d.title as disc,d.img as disc_img from `qcmusic_audios` a\n' +
                'join (select aid,group_concat(singer separator \'/\') as singer from\n' +
                '(select qs.aid,s.name as singer from `qcmusic_audio_singer` qs\n' +
                'left join `qcmusic_singers` s on qs.sid = s.sid\n' +
                'where qs.aid = ?) t_qs\n' +
                'group by aid\n' +
                'order by aid DESC) t_s\n' +
                'on a.aid = t_s.aid\n' +
                'left join `qcmusic_discs` d on a.did = d.did';
            conn.query(query, req.params.aid, function (err, rows) {
                let audio = rows[0];
                audio.src = api.private('audio/'+audio.src);
                audio.disc_img = api.public('image/'+audio.disc_img);
                audio.lyric = api.public('lyric/'+audio.lyric);
                audio.expire = parseInt(Date.now() / 1000) + 3600;
                callback(err, audio);
            });
        }
    ], asyncRes(callback));
};

exports.hot = function (req, callback) {
    let query = 'select a.*,t_s.*,d.title as disc,d.img as disc_img from `qcmusic_audios` a\n' +
        'join (select aid,group_concat(singer separator \'/\') as singer from\n' +
        '(select qs.aid,s.name as singer from `qcmusic_audio_singer` qs\n' +
        'left join `qcmusic_singers` s on qs.sid = s.sid\n' +
        ') t_qs\n' +
        'group by aid\n' +
        'order by aid DESC) t_s\n' +
        'on a.aid = t_s.aid\n' +
        'left join `qcmusic_discs` d on a.did = d.did order by count DESC limit 10';
    conn.query(query, asyncRes(callback));
};

exports.create = function (req, callback) {
    console.log(req.body)
    async.waterfall([
        function (callback) {
            let query = 'insert into `qcmusic_audios` (title,sub_title,lyric,did,src,count) values (?,?,?,?,?,0)';
            conn.query(query, [
                req.body.title,
                req.body.sub_title,
                req.body.lyric,
                req.body.did,
                req.body.src
            ], function (err, result) {
                callback(err, result.insertId);
            });
        },
        function (insertId, callback) {
            let query = 'insert into `qcmusic_audio_singer` (aid,sid) values (' + insertId + ',?)';
            let sids = req.body.sids.split(',');
            for (let sid of sids) {
                conn.query(query, sid, function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        if (sid === sids[sids.length-1]) {
                            callback(null, { newid: insertId });
                        }
                    }
                });

            }
        }
    ], asyncRes(callback));
};
