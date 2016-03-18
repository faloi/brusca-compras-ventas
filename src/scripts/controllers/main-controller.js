
angular
  .module('classroom')
  .controller('MainController', function ($scope, $state, toastr, ConversorCompra, ConversorVenta) {
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

    const generarArchivosDeTexto = () => {
      _.set($scope, 'resultado.compras', ConversorCompra.convertir($scope.maestro.compras));
      _.set($scope, 'resultado.ventas', ConversorVenta.convertir($scope.maestro.ventas));
    };

    $state.go('.maestro');
    $scope.contribuyente = {};

    $scope.parseMaestro = function(archivoXls) {
      const maestroXls = toWorkbook(archivoXls);

      try {
        validarFormatoCorrecto(maestroXls);
        $scope.maestro = _.mapValues(hojas, x => parsearExcel(maestroXls, x));

        generarArchivosDeTexto();

        $state.go('^.resultado');
      } catch(mensaje) {
        toastr.error(mensaje)
      }
    };

    $scope.descargarArchivos = () => {
      const zip = new JSZip();
      zip.file('compras-comprobantes.txt', $scope.resultado.compras.comprobantes);
      zip.file('compras-alicuotas.txt', $scope.resultado.compras.alicuotas);
      zip.file('ventas-comprobantes.txt', $scope.resultado.ventas.comprobantes);
      zip.file('ventas-alicuotas.txt', $scope.resultado.ventas.alicuotas);

      saveAs(zip.generate({type: 'blob'}), `${$scope.contribuyente.nombre} - ${moment().format('YYYY-MM-DD-HH-mm')}.zip`)
    };
  });
