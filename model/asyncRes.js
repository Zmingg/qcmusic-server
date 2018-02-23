module.exports =  (callback) => {
    return (err, result) => {
        if(err) {
            callback({
                ok: false,
                data: err
            });
        } else {
            callback({
                ok: true,
                data: result
            });
        }
    }
};