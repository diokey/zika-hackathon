'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');
var db = require('../controllers/db');
var json2csv = require('json2csv');

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

router.post('/download', function (req, res) {
  var selectedFields= req.body.fields;
  var selectedLocations = req.body.locations;
  var selectedSources = req.body.sources;

  var queries = {
    'fields': selectedFields.split(','),
    'locations': selectedLocations.split(','),
    'sources': selectedSources.split(',')
  };

  var sqlQuery = getQuery(queries);

  db.query(sqlQuery).then(function (result) {
    var fields = ['report_date', 'data_field_name', 'value', 'data_field_unit', 'location_name', 'source_name'];

    json2csv({ data: result, fields: fields }, function(err, csv) {
      if (err) {
        console.log('error writting csv', err);
        res.redirect('home');
      }

      fs.writeFile('mycsv.csv', csv, function (err) {
        if (!err) {
          res.download('mycsv.csv');
        } else {
          console.log(err);
          res.redirect('/');
        }
      });
    });
  });

});

module.exports = router;
