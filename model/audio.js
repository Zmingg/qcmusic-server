const conn = require('../conn');
const async = require('async');
const api = require('../api/qiniu');

exports.all = function () {
    querystring = 'select * from `qcmusic_audios`';
    return conn.squery(querystring);
};

exports.get = function (params) {
    return new Promise((resolve,reject) => {
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
                conn.query(query, params.aid, function (err, rows) {
                    let audio = rows[0];
                    audio.src = api.private('audio/'+audio.src);
                    audio.disc_img = api.public('image/'+audio.disc_img);
                    audio.lyric = api.public('lyric/'+audio.lyric);
                    audio.expire = parseInt(Date.now() / 1000) + 3600;
                    callback(err, audio);
                });
            }
        ], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

exports.hot = function () {
    return new Promise((resolve,reject) => {
        async.waterfall([
            function (callback) {
                let query = 'select a.*,t_s.*,d.title as disc,d.img as disc_img from `qcmusic_audios` a\n' +
                    'join (select aid,group_concat(singer separator \'/\') as singer from\n' +
                    '(select qs.aid,s.name as singer from `qcmusic_audio_singer` qs\n' +
                    'left join `qcmusic_singers` s on qs.sid = s.sid\n' +
                    ') t_qs\n' +
                    'group by aid\n' +
                    'order by aid DESC) t_s\n' +
                    'on a.aid = t_s.aid\n' +
                    'left join `qcmusic_discs` d on a.did = d.did order by count DESC limit 10';
                conn.query(query, function (err, rows) {
                    callback(err, rows);
                });
            }
        ], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};
