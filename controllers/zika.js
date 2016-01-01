'use strict';
var fs  = require('fs');
var db  = require('./db');

var sqlQuery = "SELECT * FROM location";

db.query(sqlQuery)
.then(function (rows) {
    console.log(rows);
    console.log('done');
  })
  .catch(function (err) {
    console.log(err);
  });
