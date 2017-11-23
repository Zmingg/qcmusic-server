const qiniu = require("qiniu");
qiniu.conf.ACCESS_KEY = 'qqma0f1S7NCpqULAbweW9Wc-RQ51riX9taoRydmq';
qiniu.conf.SECRET_KEY = 'dASmCaR0St7vIcCikzdPqo25_f3vtlfgR7tCVKQQ';

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