let list = require('./model/list');
let audio = require('./model/audio');
let disc = require('./model/disc');
let search = require('./model/search');

let res = (handle) => {
    return (req, res) => {
        handle(req.params).then((data) => {
            res.send(data);
        });
    }
};

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

};
