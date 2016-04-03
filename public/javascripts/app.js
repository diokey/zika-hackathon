(function app (global, context) {


  var app = (function () {
    var hiddenForm,
        downloadBtnInput,
        downloadCSVBtn,
        downloadXLSBtn,
        fieldsTable,
        sourcesTable,
        locationsTable
      ;

    var initialize = function () {
      console.log('Initialize here');
      hiddenForm = document.querySelector('#hidden_form');
      downloadBtnInput = document.querySelector('#downloadBtn');
      downloadCSVBtn = document.querySelector('#csvDownload');
      downloadXLSBtn = document.querySelector('#xlsDownload');
      fieldsTable = document.querySelector('#fieldsTable');
      sourcesTable = document.querySelector('#sourcesTable');
      locationsTable = document.querySelector('#locationsTable');

      // attach event listeners
      downloadCSVBtn && downloadCSVBtn.addEventListener('click', function (event) {
        event.preventDefault();
        document.querySelector('#file_type').value='csv';
        document.querySelector('#hidden_download_form').submit();
      });

      downloadXLSBtn && downloadXLSBtn.addEventListener('click', function (event) {
        event.preventDefault();
        document.querySelector('#file_type').value='xlsx';
        document.querySelector('#hidden_download_form').submit();
      });

      downloadBtnInput && downloadBtnInput.addEventListener('click', function (event) {
        event.preventDefault();

        var selectedFields = fieldsTable.querySelectorAll('tbody tr.is-selected');
        var selectedSources = sourcesTable.querySelectorAll('tbody tr.is-selected');
        var selectedLocations = locationsTable.querySelectorAll('tbody tr.is-selected');

        var fields = [];
        var sources = [];
        var locations = [];

        for (var i=0, l = selectedFields.length; i < l; i++) {
          fields.push(selectedFields[i].querySelectorAll('td')[1].innerText);
        }

        for (i=0, l = selectedSources.length; i < l; i++) {
          sources.push(selectedSources[i].querySelectorAll('td')[1].innerText);
        }

        for (i=0, l = selectedLocations.length; i < l; i++) {
          locations.push(selectedLocations[i].querySelectorAll('td')[1].innerText);
        }

        var data = {};
        data.fields = fields;
        data.sources = sources;
        data.locations = locations;
        document.querySelector('#fields').value = fields;
        document.querySelector('#sources').value = sources;
        document.querySelector('#locations').value = locations;

        hiddenForm.submit();

      });

    };


    return {
      initialize: initialize,
    };

  })();

  global.onload = function () {
    app.initialize();
    Paginator.init('#fieldsTable', '#fieldsPagination', 10);
    Paginator.init('#sourcesTable', '#sourcesPagination', 10);
    Paginator.init('#locationsTable', '#locationsPagination', 10);
  };

})(window, this);
