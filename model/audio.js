const conn = require('../conn');
const async = require('async');
let asyncRes = require('./asyncRes');
const api = require('../api/qiniu');

exports.all = function (req, callback) {
    let query = 'select a.*,a_g_s.*,d.title as disc,d.img as disc_img from `qcmusic_audios` a\n' +
        'join (select aid,group_concat(singer separator \'/\') as singer from\n' +
        '(select a_s.aid,s.name as singer from `qcmusic_audio_singer` a_s\n' +
        'left join `qcmusic_singers` s on a_s.sid = s.sid) a_s_s\n' +
        'group by aid\n' +
        'order by aid DESC) a_g_s\n' +
        'on a.aid = a_g_s.aid\n' +
        'left join `qcmusic_discs` d on a.did = d.did';
    conn.query(query, asyncRes(callback));
};

exports.get = function (req, callback) {
    let query = 'select a.*,a_g_s.*,d.title as disc,d.img as disc_img from `qcmusic_audios` a\n' +
        'join (select aid,group_concat(sid) as sids,group_concat(singer separator \'/\') as singer from\n' +
        '(select a_s.aid,a_s.sid,s.name as singer from `qcmusic_audio_singer` a_s\n' +
        'left join `qcmusic_singers` s on a_s.sid = s.sid) a_s_s\n' +
        'group by aid\n' +
        'order by aid DESC) a_g_s\n' +
        'on a.aid = a_g_s.aid\n' +
        'left join `qcmusic_discs` d on a.did = d.did\n' +
        'where a.aid = ?\n';
    conn.query(query, req.params.aid, (err, result) => {
        return asyncRes(callback)(err, result[0])
    });
};

// exports.get = function (req, callback) {
//     async.waterfall([
//         function (callback) {
//             let query = 'select a.*,t_s.*,d.title as disc,d.img as disc_img from `qcmusic_audios` a\n' +
//                 'join (select aid,group_concat(singer separator \'/\') as singer from\n' +
//                 '(select qs.aid,s.name as singer from `qcmusic_audio_singer` qs\n' +
//                 'left join `qcmusic_singers` s on qs.sid = s.sid\n' +
//                 'where qs.aid = ?) t_qs\n' +
//                 'group by aid\n' +
//                 'order by aid DESC) t_s\n' +
//                 'on a.aid = t_s.aid\n' +
//                 'left join `qcmusic_discs` d on a.did = d.did';
//             conn.query(query, req.params.aid, function (err, rows) {
//                 let audio = rows[0];
//                 audio.src = api.private('audio/'+audio.src);
//                 audio.disc_img = api.public('image/'+audio.disc_img);
//                 audio.lyric = api.public('lyric/'+audio.lyric);
//                 audio.expire = parseInt(Date.now() / 1000) + 3600;
//                 callback(err, audio);
//             });
//         }
//     ], asyncRes(callback));
// };

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
    async.waterfall([
        function (callback) {
            let query = 'insert into `qcmusic_audios` (title,sub_title,lyric,did,src,hq,count) values (?,?,?,?,?,?,0)';
            conn.query(query, [
                req.body.title,
                req.body.sub_title,
                req.body.lyric,
                req.body.did,
                req.body.src,
                req.body.hq
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

exports.update = function (req, callback) {
    async.waterfall([
        function (callback) {
            let query = 'update `qcmusic_audios` set title=?,sub_title=?,lyric=?,did=?,src=?,hq=?,count=? where aid=?';
            conn.query(query, [
                req.body.title,
                req.body.sub_title,
                req.body.lyric,
                req.body.did,
                req.body.src,
                req.body.hq,
                req.body.count,
                req.body.aid
            ], function (err, result) {
                callback(err, req.body.aid);
            });
        },
        function (aid, callback) {
            let query = 'select group_concat(sid) as sids from `qcmusic_audio_singer` where aid=? group by aid';
            conn.query(query, aid, function (err, result) {
                let _sids = new Set(result[0].sids.split(','));
                let sids = new Set(req.body.sids.split(','));
                let sids_add = [];
                let sids_del = [];
                for (let sid of _sids) {
                    if (!sids.has(sid)) {
                        sids_del.push(sid);
                    }
                }
                for (let sid of sids) {
                    if (!_sids.has(sid)) {
                        sids_add.push(sid);
                    }
                }
                callback(err, [sids_add, sids_del]);

            });
        },
        function (sids, callback) {
            let aid = req.body.aid;
            let query1 = 'insert into `qcmusic_audio_singer` (aid,sid) values (?,?)';
            for (let sid of sids[0]) {
                conn.query(query1, [
                    aid, sid
                ], function (err, result) {});
            }
            let query2 = 'delete from `qcmusic_audio_singer` where aid=? and sid=?';
            for (let sid of sids[1]) {
                conn.query(query2, [
                    aid, sid
                ], function (err, result) {});
            }
            callback(null, { ok:true })
        }
    ], asyncRes(callback));

};

exports.delete = function (req, callback) {
    let aid = req.body.aid;
    async.waterfall([
        function(callback) {
            let query = 'delete from `qcmusic_audios` where aid=?';
            conn.query(query, aid, function(err, result) {
                callback(err, result);
            });
        },
        function(lastRes, callback) {
            let query = 'delete from `qcmusic_audio_singer` where aid=?';
            conn.query(query, aid, function(err, result) {
                callback(err, result);
            });
        },
    ], asyncRes(callback));
};
