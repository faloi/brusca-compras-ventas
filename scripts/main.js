'use strict';

angular.module('classroom', ['ui.router', 'ngAnimate', 'toastr', 'angular-clipboard', 'ngCookies']);
'use strict';

angular.module('classroom').constant('CONFIG', {});
'use strict';

angular.module('classroom').config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('classroom', {
    abstract: true,
    views: {
      '@': {
        templateUrl: 'views/layout.html'
      },
      'navbar@classroom': {
        templateUrl: 'views/navbar.html',
        controller: 'NavbarController'
      }
    }
  }).state('classroom.main', {
    url: '/',
    authenticated: false,
    views: {
      'content@classroom': {
        templateUrl: 'views/main.html',
        controller: 'MainController'
      }
    }
  }).state('classroom.main.maestro', {
    templateUrl: 'views/main-maestro.html'
  }).state('classroom.main.resultado', {
    templateUrl: 'views/main-resultado.html'
  });

  $urlRouterProvider.otherwise('/');
});
'use strict';

angular.module('classroom').constant('TIPOS_DE_ALICUOTA', {
  iva105: 4,
  iva21: 5,
  iva27: 6,
  iva25: 9
});
'use strict';

angular.module('classroom').constant('TIPOS_DE_COMPROBANTE', {
  A: 1,
  NDA: 2,
  NCA: 3,
  B: 6,
  NDB: 7,
  NCB: 8,
  M: 51,
  NDM: 52,
  NCM: 53,
  Z: 83,
  NCZ: 113
});
'use strict';

angular.module('classroom').constant('TIPOS_DE_DOCUMENTO', {
  CONSUMIDOR_FINAL: 99,
  DNI: 96,
  CUIT: 80
});
'use strict';

angular.module('classroom').config(function (toastrConfig) {

  angular.extend(toastrConfig, {
    positionClass: 'toast-top-full-width',
    preventDuplicates: false,
    preventOpenDuplicates: false,
    target: 'body'
  });
});
'use strict';

angular.module('classroom').controller('MainController', function ($scope, $state, toastr, ConversorCompra, ConversorVenta) {
  var hojas = {
    compras: "Compras",
    ventas: "Ventas"
  };

  var toWorkbook = function toWorkbook(xlsBinary) {
    return XLSX.read(xlsBinary, { type: 'binary' });
  };
  var getSheet = function getSheet(nombreHoja, workbook) {
    return _.mapKeys(workbook.Sheets, function (v, k) {
      return k.toLowerCase();
    })[nombreHoja.toLowerCase()];
  };

  var parsearExcel = function parsearExcel(archivo, nombreHoja) {
    var hoja = XLSX.utils.sheet_to_json(getSheet(nombreHoja, archivo));
    var convertirColumnasACamelCase = function convertirColumnasACamelCase(x) {
      return _.mapKeys(x, function (valor, clave) {
        return _.camelCase(clave);
      });
    };

    return _(hoja).map(convertirColumnasACamelCase).filter('tipo').value();
  };

  var validarFormatoCorrecto = function validarFormatoCorrecto(workbook) {
    if (!_.every(hojas, function (nombre) {
      return _.isObject(getSheet(nombre, workbook));
    })) {
      throw "La planilla no tiene el formato adecuado. Para que funcione correctamente, debe tener una hoja llamada Ventas y otra llamada Compras.";
    }
  };

  var generarArchivosDeTexto = function generarArchivosDeTexto() {
    _.set($scope, 'resultado.compras', ConversorCompra.convertir($scope.maestro.compras));
    _.set($scope, 'resultado.ventas', ConversorVenta.convertir($scope.maestro.ventas));
  };

  $state.go('.maestro');
  $scope.contribuyente = {};

  $scope.parseMaestro = function (archivoXls) {
    var maestroXls = toWorkbook(archivoXls);

    try {
      validarFormatoCorrecto(maestroXls);
      $scope.maestro = _.mapValues(hojas, function (x) {
        return parsearExcel(maestroXls, x);
      });

      generarArchivosDeTexto();

      $state.go('^.resultado');
    } catch (mensaje) {
      toastr.error(mensaje);
    }
  };

  $scope.descargarArchivos = function () {
    var zip = new JSZip();
    zip.file('compras-comprobantes.txt', $scope.resultado.compras.comprobantes);
    zip.file('compras-alicuotas.txt', $scope.resultado.compras.alicuotas);
    zip.file('ventas-comprobantes.txt', $scope.resultado.ventas.comprobantes);
    zip.file('ventas-alicuotas.txt', $scope.resultado.ventas.alicuotas);

    saveAs(zip.generate({ type: 'blob' }), $scope.contribuyente.nombre + ' - ' + moment().format('YYYY-MM-DD-HH-mm') + '.zip');
  };
});
'use strict';

angular.module('classroom').controller('NavbarController', function ($scope, $state) {
  $scope.$state = $state;
});
'use strict';

angular.module('classroom').directive('onReadFile', function ($parse) {
  return {
    restrict: 'A',
    scope: false,
    link: function link(scope, element, attrs) {
      var fn = $parse(attrs.onReadFile);
      return element.on('change', function (onChangeEvent) {
        var reader;
        reader = new FileReader();
        reader.onload = function (onLoadEvent) {
          return scope.$apply(function () {
            return fn(scope, {
              $fileContent: onLoadEvent.target.result
            });
          });
        };
        return reader.readAsBinaryString((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
      });
    }
  };
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

angular.module('classroom').factory('FixedLengthBuilder', function () {
  var FixedLengthBuilder = function () {
    function FixedLengthBuilder(format, delimiter) {
      _classCallCheck(this, FixedLengthBuilder);

      this.format = format;
      this.delimiter = delimiter || '\r\n';
      this.converters = {
        date: {
          parse: moment,
          convert: function convert(value, column) {
            return value.format('YYYYMMDD');
          }
        },
        integer: {
          parse: function parse(x) {
            return _.isNil(x) ? 0 : parseInt(x);
          },
          convert: function convert(value, column) {
            return _.padStart(value, column.length, '0');
          }
        },
        string: {
          parse: _.identity,
          convert: function convert(value, column) {
            return _.padEnd(value, column.length);
          }
        },
        decimal: {
          parse: _.flow(numeral().unformat, Math.abs),
          convert: function convert(value, column) {
            return _.padStart(value.toFixed(column.decimals).replace('.', ''), column.length, '0');
          }
        }
      };
    }

    _createClass(FixedLengthBuilder, [{
      key: 'build',
      value: function build(objects, deburr) {
        var transform = deburr ? _.deburr : _.identity;
        return transform(objects.map(this._buildOne, this).join(this.delimiter));
      }
    }, {
      key: '_buildOne',
      value: function _buildOne(obj) {
        var _this = this;

        var mapColumn = function mapColumn(column) {
          var value = _.isNil(obj[column.name]) ? column.default : obj[column.name];
          return _this._padValue(value, column).substr(0, column.length);
        };

        return this.format.map(mapColumn).join('');
      }
    }, {
      key: '_padValue',
      value: function _padValue(value, column) {
        var converter = this.converters[column.type];
        return converter.convert(converter.parse(value), column);
      }
    }]);

    return FixedLengthBuilder;
  }();

  return FixedLengthBuilder;
});
'use strict';

angular.module('classroom').service('ConversorCompra', function (FixedLengthBuilder, TIPOS_DE_ALICUOTA, TIPOS_DE_COMPROBANTE, TIPOS_DE_DOCUMENTO) {
  var formatos = {
    comprobantes: [{ name: 'fecha', type: 'date', length: 8 }, { name: 'tipo', type: 'integer', length: 3 }, { name: 'puntoVenta', type: 'integer', length: 5 }, { name: 'numeroComprobante', type: 'integer', length: 20 }, { name: 'numeroDespachoImportacion', type: 'string', length: 16, default: '' }, { name: 'codigoDocumentoVendedor', type: 'integer', length: 2, default: TIPOS_DE_DOCUMENTO.CUIT }, { name: 'numeroIdentificacionVendedor', type: 'integer', length: 20 }, { name: 'apellidoNombreVendedor', type: 'string', length: 30 }, { name: 'importeTotalOperacion', type: 'decimal', decimals: 2, length: 15 }, { name: 'importeTotalConceptosNoGravado', type: 'decimal', decimals: 2, length: 15, default: 0 }, { name: 'importeOperacionesExentas', type: 'decimal', decimals: 2, length: 15 }, { name: 'importePercepcionIva', type: 'decimal', decimals: 2, length: 15 }, { name: 'importePercepcionOtrosImpuestos', type: 'decimal', decimals: 2, length: 15 }, { name: 'importePercepcionIngresosBrutos', type: 'decimal', decimals: 2, length: 15 }, { name: 'importePercepcionImpuestosMunicipales', type: 'decimal', decimals: 2, length: 15 }, { name: 'importeImpuestosInternos', type: 'decimal', decimals: 2, length: 15 }, { name: 'codigoMoneda', type: 'string', length: 3, default: 'PES' }, { name: 'tipoCambio', type: 'decimal', decimals: 6, length: 10, default: 1 }, { name: 'cantidadAlicuotasIva', type: 'integer', length: 1 }, { name: 'codigoOperacion', type: 'string', length: 1, default: '0' }, { name: 'creditoFiscalComputable', type: 'integer', length: 15, default: 0 }, { name: 'otrosTributos', type: 'integer', length: 15 }, { name: 'cuitEmisor', type: 'integer', length: 11, default: 0 }, { name: 'denominacionEmisor', type: 'string', length: 30, default: '' }, { name: 'ivaComision', type: 'decimal', decimals: 2, length: 15, default: 0 }],

    alicuotas: [{ name: 'tipo', type: 'integer', length: 3 }, { name: 'puntoVenta', type: 'integer', length: 5 }, { name: 'numeroComprobante', type: 'integer', length: 20 }, { name: 'codigoDocumentoVendedor', type: 'integer', length: 2, default: 80 }, { name: 'numeroIdentificacionVendedor', type: 'integer', length: 20 }, { name: 'importeNetoGravado', type: 'decimal', decimals: 2, length: 15 }, { name: 'alicuotaIva', type: 'integer', length: 4 }, { name: 'impuestoLiquidado', type: 'decimal', decimals: 2, length: 15 }]
  };

  return {
    convertir: function convertir(compras) {
      compras.forEach(function (c) {
        var alicuotas = _.pickBy(c, function (value, key) {
          return key.startsWith('iva');
        });

        c.alicuotas = _.map(alicuotas, function (monto, tipo) {
          return {
            alicuotaIva: TIPOS_DE_ALICUOTA[tipo],
            impuestoLiquidado: monto,
            importeNetoGravado: c[_.camelCase('base ' + tipo)]
          };
        });
      });

      var datos = {
        comprobantes: _.map(compras, function (x) {
          return _.extend(x, {
            cantidadAlicuotasIva: x.alicuotas.length,
            tipo: TIPOS_DE_COMPROBANTE[x.tipo]
          });
        }),
        alicuotas: _.flatMap(compras, function (comprobante) {
          return comprobante.alicuotas.map(function (x) {
            return _.extend(x, _.omit(comprobante, 'alicuotas'));
          });
        })
      };

      return _.mapValues(formatos, function (x, tipo) {
        return new FixedLengthBuilder(x).build(datos[tipo], true);
      });
    }
  };
});
'use strict';

angular.module('classroom').service('ConversorVenta', function (FixedLengthBuilder, TIPOS_DE_ALICUOTA, TIPOS_DE_COMPROBANTE, TIPOS_DE_DOCUMENTO) {
  var formatos = {
    comprobantes: [{ name: 'fecha', type: 'date', length: 8 }, { name: 'tipo', type: 'integer', length: 3 }, { name: 'puntoVenta', type: 'integer', length: 5 }, { name: 'numeroComprobante', type: 'integer', length: 20 }, { name: 'numeroComprobanteHasta', type: 'integer', length: 20 }, { name: 'codigoDocumentoComprador', type: 'integer', length: 2 }, { name: 'numeroIdentificacionComprador', type: 'integer', length: 20 }, { name: 'apellidoNombreComprador', type: 'string', length: 30 }, { name: 'importeTotalOperacion', type: 'decimal', decimals: 2, length: 15 }, { name: 'importeTotalConceptosNoGravado', type: 'decimal', decimals: 2, length: 15, default: 0 }, { name: 'percepcionNoCategorizados', type: 'decimal', decimals: 2, length: 15, default: 0 }, { name: 'importeOperacionesExentas', type: 'decimal', decimals: 2, length: 15 }, { name: 'importePercepcionImpuestosNacionales', type: 'decimal', decimals: 2, length: 15 }, { name: 'importePercepcionIngresosBrutos', type: 'decimal', decimals: 2, length: 15 }, { name: 'importePercepcionImpuestosMunicipales', type: 'decimal', decimals: 2, length: 15 }, { name: 'importeImpuestosInternos', type: 'decimal', decimals: 2, length: 15 }, { name: 'codigoMoneda', type: 'string', length: 3, default: 'PES' }, { name: 'tipoCambio', type: 'decimal', decimals: 6, length: 10, default: 1 }, { name: 'cantidadAlicuotasIva', type: 'integer', length: 1 }, { name: 'codigoOperacion', type: 'string', length: 1, default: '0' }, { name: 'otrosTributos', type: 'integer', length: 15 }, { name: 'fechaVencimientoPago', type: 'decimal', decimals: 2, length: 15, default: 0 }],

    alicuotas: [{ name: 'tipo', type: 'integer', length: 3 }, { name: 'puntoVenta', type: 'integer', length: 5 }, { name: 'numeroComprobante', type: 'integer', length: 20 }, { name: 'importeNetoGravado', type: 'decimal', decimals: 2, length: 15 }, { name: 'alicuotaIva', type: 'integer', length: 4 }, { name: 'impuestoLiquidado', type: 'decimal', decimals: 2, length: 15 }]
  };

  var inferirCodigoDocumento = function inferirCodigoDocumento(comprobante) {
    if (_.isNil(comprobante.numeroIdentificacionComprador)) {
      return TIPOS_DE_DOCUMENTO.CONSUMIDOR_FINAL;
    }

    var cantidadDigitos = function cantidadDigitos(numero) {
      return numero.toString().length;
    };

    return _.inRange(cantidadDigitos(comprobante.numeroIdentificacionComprador), 7, 9) ? TIPOS_DE_DOCUMENTO.DNI : TIPOS_DE_DOCUMENTO.CUIT;
  };

  return {
    convertir: function convertir(ventas) {
      ventas.forEach(function (c) {
        c.codigoDocumentoComprador = inferirCodigoDocumento(c);
        if (_.isNil(c.numeroComprobanteHasta)) {
          c.numeroComprobanteHasta = c.numeroComprobante;
        }

        var alicuotas = _.pickBy(c, function (value, key) {
          return key.startsWith('iva');
        });
        c.alicuotas = _.map(alicuotas, function (monto, tipo) {
          return {
            alicuotaIva: TIPOS_DE_ALICUOTA[tipo],
            impuestoLiquidado: monto,
            importeNetoGravado: c[_.camelCase('base ' + tipo)]
          };
        });
      });

      var datos = {
        comprobantes: _.map(ventas, function (x) {
          return _.extend(x, {
            cantidadAlicuotasIva: x.alicuotas.length,
            tipo: TIPOS_DE_COMPROBANTE[x.tipo]
          });
        }),
        alicuotas: _.flatMap(ventas, function (comprobante) {
          return comprobante.alicuotas.map(function (x) {
            return _.extend(x, _.omit(comprobante, 'alicuotas'));
          });
        })
      };

      return _.mapValues(formatos, function (x, tipo) {
        return new FixedLengthBuilder(x).build(datos[tipo], true);
      });
    }
  };
});
'use strict';

angular.module('classroom').service('RememberSetting', function ($state, $cookies) {
  return function (scope, key) {
    var cookieName = $state.current.name + "-" + key;

    scope[key] = _.get($cookies.getObject(cookieName), 'value');
    scope.$watch(key, function (newValue, oldValue) {
      if (_.isNil(newValue)) {
        $cookies.remove(cookieName);
      } else {
        $cookies.putObject(cookieName, { value: newValue });
      }
    });
  };
});