const qiniu = require('qiniu');
const key = require('./key');
qiniu.conf.ACCESS_KEY = key.ACCESS_KEY;
qiniu.conf.SECRET_KEY = key.SECRET_KEY;

const privateDomain = 'http://ow7kqez1l.bkt.clouddn.com';

exports.private = (req, callback) => {
    let mac = new qiniu.auth.digest.Mac();
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(mac, config);
    let privateBucketDomain = privateDomain;
    let deadline = parseInt(Date.now() / 1000) + 3600; // 1小时过期
    let key = req.body.key;
    let url = bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);
    callback({ok: true, data: {
        src: url,
        expire: deadline
    }})

};

const scopes = {
    'audio': 'qcmusic-audios',
    'image': 'qcmusic',
    'lyric': 'qcmusic'
};

exports.uploadToken = (req, callback) => {
    let scope = scopes[req.body.prefix];
    let options = {
        scope: scope
    };
    let putPolicy = new qiniu.rs.PutPolicy(options);
    let mac = new qiniu.auth.digest.Mac(key.ACCESS_KEY, key.SECRET_KEY);
    callback({
        ok: true,
        uptoken: putPolicy.uploadToken(mac)
    });
};