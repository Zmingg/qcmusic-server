let mysql = require('mysql');

let connection = mysql.createConnection({
    host : '127.0.0.1',
    port:'3306',
    user : 'root',
    password : 'blank1987',
    database : 'qc'
});

connection.connect();

// connection.squery = function (querystring, params) {
//     return new Promise(function(resolve,reject){
//         connection.query(querystring, params, function(err, rows, fields) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// };

module.exports = connection;