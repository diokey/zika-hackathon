'use strict';
var mysql = require('mysql');

var pool  = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'diokey',
  database: 'zika_demo'
});

module.exports.query = function (queryString) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      // Use the connection
      var handleError = function (err) {
      // no error occurred, continue with the request
      if (!err) {
        return false;
      }

      // An error occurred, remove the client from the connection pool.
      reject(err);
      if (connection) {
        connection.release();
      }
      return true;
    };

      // handle an error from the connection
      if (handleError(err)) {
        return;
      }
      connection.query(queryString, function (err, rows) {
        if (handleError(err)) {
          return;
        }
        resolve(rows);
        connection.release();
      });

    });
  });
};

