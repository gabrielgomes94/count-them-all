angular.module('starter.services', [])
.factory('Entries', function (pouchDB, CSV, $cordovaFile) {
  //todo, persist on localStorage and a file
  var db = pouchDB('countThemAll.Entries');
  var entries = [];

  var allEntries = function () {
    return db.allDocs({include_docs: true, descending: true});
  }
  var addEntry = function (entry) {
    entry.startedAt = new Date();
    return db.info().then(function (result) {
      entry.id = result.doc_count;
      entry._id = result.update_seq.toString();
      return db.put(entry);
    }).then(function (resultPut) {
      return db.get(resultPut.id);
    });
  }
  var removeEntry = function (entry) {
    return db.remove(entry.doc._id, entry.doc._rev);
  }
  var exportEntries = function () {
    return allEntries().then(function (res) {
      var entries = _.map(res.rows, function (item) {
        return item.doc;
      });
      return CSV.build(entries);
    }).then(function (csv) {
      return $cordovaFile.writeFile(cordova.file.dataDirectory, "countThemAll.csv", csv, true)
    });
  }
  return{
    all: allEntries,
    add: addEntry,
    remove: removeEntry,
    export: exportEntries
  }
})
.factory('CSV', function ($q, $filter) {
  var buildCSV = function (data) {
    var csv = "";
    var csv = _.keys(data[0]).join(',')+'\n';
    var row = "";
    _.each(data, function (item) {
      var date = $filter('date')(item.startedAt, 'EEEE  H:mm:ss,  dd/MM/yyyy');
      var timer = item.totalTimer.hours+':'+item.totalTimer.minutes+':'+item.totalTimer.seconds;
      row = item.id.toString()+','+date+','+item.walkers.toString()+','+item.bicycles.toString()+','+item.cars.toString()+','+item.motorcycles.toString()+','+timer+','+item._id+','+item._rev+'\n';
      csv += row;
    });
    return $q(function (resolve, reject) {
      resolve(csv);
    });
  }
  return{
    build: buildCSV
  }
})
