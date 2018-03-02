let conn = require('../conn');
let async = require('async');
let asyncRes = require('./asyncRes');

exports.all = function (req, callback) {
    let query = 'select * from `qcmusic_lists`';
    conn.query(query, asyncRes(callback));
};

exports.page = function (req, callback) {
    let page = ~~req.body.page;
    let query = 'select * from `qcmusic_lists` order by lid desc limit ?,10';
    let offset = 10 * (page - 1);
    conn.query(query, offset, (err, rows)=>{
        query = 'SELECT count(*) as total from `qcmusic_lists`';
        let lists = rows;
        conn.query(query, offset, (err, rows)=>{
            let total = rows[0].total;
            let pages = Math.ceil(total/10);
            asyncRes(callback)(err, {
                lists: lists,
                hasmore: pages > page,
                curpage: page,
                pages: pages,
                total: total
            });
        });
    });
};

exports.get = function (req, callback) {
    async.waterfall([
        function(callback) {
            let query = 'select * from `qcmusic_lists` where lid = ?';
            conn.query(query, req.params.lid, function(err, rows) {
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
    ], asyncRes(callback));
};

exports.update = function (req, callback) {
    let query = 'update `qcmusic_lists` set title=?, tags=?, aids=?, img=?, count=? where lid=?';
    conn.query(query, [
        req.body.title,
        req.body.tags,
        req.body.aids,
        req.body.img,
        req.body.count,
        req.body.lid,
    ], asyncRes(callback));
};

exports.create = function (req, callback) {
    let query = 'insert into `qcmusic_lists` (title,tags,aids,img,count) values (?,?,?,?,0)';
    conn.query(query, [
        req.body.title,
        req.body.tags,
        req.body.aids,
        req.body.img,
    ], asyncRes(callback));
};

exports.delete = function (req, callback) {
    let query = 'delete from `qcmusic_lists` where lid=?';
    conn.query(query, req.body.lid, asyncRes(callback));
};