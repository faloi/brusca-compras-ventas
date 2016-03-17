
angular
  .module('classroom')
  .controller('MainController', function ($scope, $state) {
    const getSheet = (nombreHoja, workbook) => workbook.Sheets[nombreHoja];
    const toWorkbook = xlsBinary => XLSX.read(xlsBinary, {type: 'binary'});

    const parsearExcel = (archivo, nombreHoja) => XLSX.utils.sheet_to_json(getSheet(nombreHoja, toWorkbook(archivo)));

    $state.go('.maestro');

    $scope.parseMaestro = function(maestroXls) {
      $scope.maestro = {
        compras: parsearExcel(maestroXls, "Compras"),
        ventas: parsearExcel(maestroXls, "Ventas")
      };

      $state.go('^.resultado');
    };
  });
