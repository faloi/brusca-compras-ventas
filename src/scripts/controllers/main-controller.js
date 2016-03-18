
angular
  .module('classroom')
  .controller('MainController', function ($scope, $state, toastr) {
    const hojas = {
      compras: "Compras",
      ventas: "Ventas"
    };

    const toWorkbook = xlsBinary => XLSX.read(xlsBinary, {type: 'binary'});

    const getSheet = (nombreHoja, workbook) => workbook.Sheets[nombreHoja];
    const parsearExcel = (archivo, nombreHoja) => {
      const hoja = XLSX.utils.sheet_to_json(getSheet(nombreHoja, archivo));
      const convertirColumnasACamelCase = x => _.mapKeys(x, (valor, clave) => _.camelCase(clave));

      return _.map(hoja, convertirColumnasACamelCase);
    };

    const validarFormatoCorrecto = workbook => {
      if (!_.every(hojas, nombre => _.isObject(workbook.Sheets[nombre]))) {
        throw "La planilla no tiene el formato adecuado. Para que funcione correctamente, debe tener una hoja llamada Ventas y otra llamada Compras."
      }
    };

    $state.go('.maestro');

    $scope.parseMaestro = function(archivoXls) {
      const maestroXls = toWorkbook(archivoXls);

      try {
        validarFormatoCorrecto(maestroXls);
        $scope.maestro = _.mapValues(hojas, x => parsearExcel(maestroXls, x));

        $state.go('^.resultado');
      } catch(mensaje) {
        toastr.error(mensaje)
      }
    };
  });
