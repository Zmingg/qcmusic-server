let conn = require('../conn.js');

exports.all = function () {
    querystring = 'select * from `qcmusic_discs`';
    return conn.squery(querystring);
};

exports.get = function (params) {
    querystring = 'select * from `qcmusic_discs` where did = ?';
    return conn.squery(querystring, params.did);
};
