const conn = require('../conn');
const async = require('async');
const api = require('../api/qiniu');

exports.hot = function () {
    return new Promise((resolve,reject) => {
        async.parallel([
            function (callback) {
                let query = 'select title as name from `qcmusic_discs` order by count desc limit 3';
                conn.query(query, function (err, rows) {
                    callback(err, rows);
                });
            },
            function (callback) {
                let query = 'select title as name from `qcmusic_audios` order by count desc limit 3';
                conn.query(query, function (err, rows) {
                    callback(err, rows);
                });
            }
        ], function (err, result) {
            if (err) {
                reject(err);
            }
            let data = [];
            for (let arr of result) {
                data = data.concat(arr);
            }
            resolve(data);
        });
    });
};

exports.search = function (params) {
    return new Promise((resolve,reject) => {
        async.parallel([
            function (callback) {
                let query = 'select d.*,s.name as singer from `qcmusic_discs` d\n' +
                    'left join `qcmusic_singers` s on d.sid = s.sid\n' +
                    'where title like \'%'+ params.key +'%\' limit 1';
                conn.query(query, function (err, rows) {
                    if (rows.length) {
                        rows[0].img = api.public('image/' + rows[0].img);
                        rows[0].type = 'disc';
                    }
                    callback(err, rows);
                });
            },
            function (callback) {
                let query = 'select s.*,count(a.aid) as audio_count,count(d.did) as disc_count from `qcmusic_singers` s\n' +
                    'left join `qcmusic_discs` d on s.sid = d.sid\n' +
                    'left join `qcmusic_audio_singer` a on s.sid = a.sid\n' +
                    'where s.name like \'%'+ params.key + '%\'' +
                    'group by sid\n';
                conn.query(query, function (err, rows) {
                    if (err) {
                        callback(err);
                    }
                    if (rows.length) {
                        rows[0].type = 'singer';
                        callback(null, rows[0]);
                    } else {
                        callback(null, rows);
                    }

                });
            },
            function (callback) {
                let query = 'select a.*,t_s.*,d.title as disc from `qcmusic_audios` a\n' +
                    'join (select aid,group_concat(singer separator \'/\') as singer from\n' +
                    '(select qs.aid,s.name as singer from `qcmusic_audio_singer` qs\n' +
                    'left join `qcmusic_singers` s on qs.sid = s.sid) t_qs\n' +
                    'group by aid\n' +
                    'order by aid DESC) t_s\n' +
                    'on a.aid = t_s.aid\n' +
                    'left join `qcmusic_discs` d on a.did = d.did\n' +
                    'where a.title like \'%' + params.key + '%\'\n' +
                    'or d.title like \'%' + params.key + '%\'\n' +
                    'or t_s.singer like \'%' + params.key + '%\'';
                conn.query(query, function (err, rows) {
                    callback(err, rows);
                });
            },
        ], function (err, result) {
            if (err) {
                reject(err);
            }
            let data = [];
            for (let arr of result) {
                data = data.concat(arr);
            }
            resolve(data);
        });
    });
};
