
angular
  .module('classroom')
  .controller('MainController', function ($scope, $state) {
    const firstSheet = workbook => workbook.Sheets[workbook.SheetNames[0]];
    const toWorkbook = xlsBinary => XLSX.read(xlsBinary, {type: 'binary'});

    $state.go('.maestro');

    $scope.parseMaestro = function(maestroXls) {
      $scope.maestro = XLSX.utils.sheet_to_json(firstSheet(toWorkbook(maestroXls)));
      console.log($scope.maestro);
      $state.go('^.resultado');
    };
  });
