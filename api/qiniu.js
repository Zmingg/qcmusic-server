const qiniu = require('qiniu');
const key = require('./key');
qiniu.conf.ACCESS_KEY = key.ACCESS_KEY;
qiniu.conf.SECRET_KEY = key.SECRET_KEY;

exports.public = (key) => {
    let mac = new qiniu.auth.digest.Mac();
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(mac, config);
    let publicBucketDomain = 'http://oxjyut4f0.bkt.clouddn.com';
    return bucketManager.publicDownloadUrl(publicBucketDomain, key);

};

exports.private = (key) => {
    let mac = new qiniu.auth.digest.Mac();
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(mac, config);
    let privateBucketDomain = 'http://ow7kqez1l.bkt.clouddn.com';
    let deadline = parseInt(Date.now() / 1000) + 3600; // 1小时过期
    return bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);
};

exports.uploadToken = () => {
    let options = {
        scope: 'qcmusic-audios'
    };
    let putPolicy = new qiniu.rs.PutPolicy(options);
    let mac = new qiniu.auth.digest.Mac(key.ACCESS_KEY, key.SECRET_KEY);
    return {
        uptoken: putPolicy.uploadToken(mac)
    }
};