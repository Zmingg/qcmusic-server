const list = require('./model/list');
const audio = require('./model/audio');
const disc = require('./model/disc');
const search = require('./model/search');
const singer = require('./model/singer');

let res = (handle) => {
    return (req, res) => {
        handle(req, (data) => {
            res.send(data);
        });
    }
};

const multer = require('multer');
const { uploadToken } = require('./api/qiniu');

module.exports = (app) => {

    app.get('/lists', res(list.all));
    app.get('/list/:lid', res(list.get));

    app.get('/audios', res(audio.all));
    app.get('/audios/hot', res(audio.hot));
    app.get('/audio/:aid', res(audio.get));
    app.post('/audio/create', multer().none(), res(audio.create));

    app.get('/singers', res(singer.all));
    app.get('/singer/:sid', res(singer.get));
    app.post('/singer', multer().none(), res(singer.create));
    app.put('/singer', multer().none(), res(singer.update));
    app.delete('/singer', multer().none(), res(singer.delete));

    app.get('/discs', res(disc.all));
    app.get('/disc/:did', res(disc.get));
    app.post('/disc', multer().none(), res(disc.create));
    app.put('/disc', multer().none(), res(disc.update));
    app.delete('/disc', multer().none(), res(disc.delete));

    app.get('/hot_keys', res(search.hot));
    app.get('/search/:key', res(search.search));

    app.get('/upload_token', (req,res)=>{
        res.send(uploadToken());
    });

};
