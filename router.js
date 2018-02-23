const list = require('./model/list');
const audio = require('./model/audio');
const disc = require('./model/disc');
const search = require('./model/search');

let res = (handle) => {
    return (req, res) => {
        handle(req, (data) => {
            res.send(data);
        });
    }
};

const { uploadToken } = require('./api/qiniu');

module.exports = (app) => {

    app.get('/lists', res(list.all));
    app.get('/list/:lid', res(list.get));

    app.get('/audios', res(audio.all));
    app.get('/audios/hot', res(audio.hot));
    app.get('/audio/:aid', res(audio.get));

    app.get('/discs', res(disc.all));
    app.get('/disc/:did', res(disc.get));

    app.get('/hot_keys', res(search.hot));
    app.get('/search/:key', res(search.search));

    app.get('/upload_token', (req,res)=>{
        res.send(uploadToken());
    });

};
