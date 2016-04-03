'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');
var db = require('../controllers/db');
var json2csv = require('json2csv');
var excelbuilder = require('msexcel-builder');

var getQuery = function (options) {
  var fields = options.fields;
  var locations = options.locations;
  var sources = options.sources;
  var dateRange = options.dateRange;

  var query = `
    SELECT * FROM zika_data zd
    JOIN zika_data_fields zdf
    ON zd.data_field_id = zdf.id
    JOIN location l
    ON zd.location_id = l.id
    JOIN zika_source zs
    ON zd.source_id = zs.id
    WHERE 1=1
  `;

  if (fields && fields.length) {
    query += ` AND data_field_name IN ('${fields.join("','")}')`;
  }

  if (locations && locations.length) {
    query += ` AND location_name IN ('${locations.join("','")}')`;
  }

  if (sources && sources.length) {
    query += ` AND source_name IN ('${sources.join("','")}')`;
  }

  console.log(query);

  return query;
};


/* GET home page. */
router.get('/', function(req, res) {

  var locationsQuery = "SELECT * FROM location";
  var dataFieldQuery  = "SELECT * FROM zika_data_fields";
  var sourcesQuery = "SELECT * FROM zika_source";
  var locations = db.query(locationsQuery);
  var fields = db.query(dataFieldQuery);
  var sources = db.query(sourcesQuery);

    Promise.all([locations, fields, sources]).then(function (data) {
      res.render('home', {
        'locations': data[0],
        'fields': data[1],
        'sources': data[2]
      });
    }).catch(e=>{
      console.log('error: ', e);
      res.render('home', {});
    });

});

router.post('/api/search', function (req, res) {
  var queries = {
    'fields': ['Travel-associated cases', 'Locally acquired cases'],
    'locations': ['Alabama', 'Arizona'],
    'sources': ['CDC']
  };
  var sqlQuery = getQuery(queries);
  db.query(sqlQuery).then(rows => {
    res.status(200).json(rows);
  })
  .catch(e => {
    console.log(e);
    res.status(500).json({'errorMessage': 'An error occurred'});
  })
});

router.post('/results', function (req, res) {

  var selectedFields= req.body.fields;
  var selectedLocations = req.body.locations;
  var selectedSources = req.body.sources;

  var queries = {
    'fields': !selectedFields ? null : selectedFields.split(','),
    'locations': !selectedLocations? null : selectedLocations.split(','),
    'sources': !selectedSources? null : selectedSources.split(',')
  };
  var sqlQuery = getQuery(queries);
  var resultQuery = db.query(sqlQuery);

  Promise.all([resultQuery]).then(function (data) {
    res.render('result', {
      'results': data[0],
      'query': queries
    });
  }).catch(e=>{
    console.log('error: ', e);
    res.render('home', {});
  });

});

var createCSV = (sqlQuery, callback) => {
  db.query(sqlQuery).then(function (result) {
    // downloadCsv(result, fields, res);
    var fields = ['report_date', 'data_field_name', 'value', 'data_field_unit', 'location_name', 'source_name'];

    json2csv({ data: result, fields: fields }, function(err, csv) {
      if (err) {
        console.log('error writting csv', err);
        res.redirect('home');
      }

      fs.writeFile('mycsv.csv', csv, function (err) {
        if (!err) {
          callback(null, 'mycsv.csv');
        } else {
          console.log(err);
          callback(err, null);
        }
      });
    });
  });
};

var createExcel = (sqlQuery, callback) => {
  var cols = ['report_date', 'data_field_name', 'value', 'data_field_unit', 'location_name', 'source_name'];
  var workbook = excelbuilder.createWorkbook('./', 'myxls.xlsx');
  console.log(sqlQuery);
  db.query(sqlQuery).then(function (data) {
    //titles
    var sheet1 = workbook.createSheet('sheet1', cols.length, data.length);
    cols.forEach((col, c) => {
      sheet1.set(c+1, 1, col);
    });

    data.forEach((row,i) => {
      cols.forEach((col, j) => {
        try {
          sheet1.set(j+1, i+2, row[col]);
        } catch(e) {
          console.log(e);
        }
      });
    });

    workbook.save(function (ok) {
      if (!ok) {
        callback(null, 'myxls.xlsx');
      } else {
        callback(new Error('Unable to create XLSX'), null);
      }
    });
  })
  .catch(e=> callback(e, null));


};

router.post('/download', function (req, res) {
  var selectedFields= req.body.fields;
  var selectedLocations = req.body.locations;
  var selectedSources = req.body.sources;
  var file_type = req.body.file_type;

  var queries = {
    'fields': !selectedFields ? null : selectedFields.split(','),
    'locations': !selectedLocations? null : selectedLocations.split(','),
    'sources': !selectedSources? null : selectedSources.split(',')
  };

  var sqlQuery = getQuery(queries);

  console.log('File type', file_type);
  if (file_type === 'xlsx') {
    createExcel(sqlQuery, function (err, file_name) {
      if (!err) {
        res.download(file_name);
      } else {
        console.log(err);
        res.redirect('/');
      }
    });

  } else {
    createCSV(sqlQuery, function (err, file_name) {
      if (!err) {
        res.download(file_name);
      } else {
        console.log(err);
        res.redirect('/');
      }
    });
  }

});

module.exports = router;
