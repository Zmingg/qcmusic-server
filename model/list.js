let conn = require('../conn.js');
let async = require('async');
let imgUrl = 'http://oxjyut4f0.bkt.clouddn.com/image/';

exports.all = function () {
    let query = 'select *,concat(\'' + imgUrl + '\',img) as img from `qcmusic_lists`';
    return conn.squery(query);
};

exports.get = function (params) {
    return new Promise((resolve,reject) => {
        async.waterfall([
            function(callback) {
                let query = 'select *,concat(\'' + imgUrl + '\',img) as img from `qcmusic_lists` where lid = ?';
                conn.query(query, params.lid, function(err, rows) {
                    callback(err, rows[0]);
                });
            },
            function(list, callback) {
                let aids = list.aids.split(',');
                list.audios = [];
                let query = 'select a.*,t_s.*,d.title as disc from `qcmusic_audios` a\n' +
                    'join (select aid,group_concat(singer separator \'/\') as singer from\n' +
                    '(select qs.aid,s.name as singer from `qcmusic_audio_singer` qs\n' +
                    'left join `qcmusic_singers` s on qs.sid = s.sid\n' +
                    'where qs.aid = ?) t_qs\n' +
                    'group by aid\n' +
                    'order by aid DESC) t_s\n' +
                    'on a.aid = t_s.aid\n' +
                    'left join `qcmusic_discs` d on a.did = d.did';
                for (let aid of aids) {
                    conn.query(query, aid, function(err, rows) {
                        if (err) {
                            callback(err);
                        } else {
                            list.audios.push(rows[0]);
                            if (aid === aids[aids.length-1]) {
                                callback(null, list);
                            }
                        }
                    });
                }
            }
        ], function (err, result) {
            if(err) {
                reject(err);
            }
            resolve(result);
        });
    });



};