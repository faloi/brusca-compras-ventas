
angular
  .module('classroom')
  .service('ConversorVenta', function(FixedLengthBuilder, TIPOS_DE_ALICUOTA, TIPOS_DE_COMPROBANTE, TIPOS_DE_DOCUMENTO) {
    const formatos = {
      comprobantes: [
        { name: 'fecha', type: 'date', length: 8 },
        { name: 'tipo', type: 'integer', length: 3 },
        { name: 'puntoVenta', type: 'integer', length: 5 },
        { name: 'numeroComprobante', type: 'integer', length: 20 },
        { name: 'numeroComprobanteHasta', type: 'integer', length: 20 },
        { name: 'codigoDocumentoComprador', type: 'integer', length: 2 },
        { name: 'numeroIdentificacionComprador', type: 'integer', length: 20 },
        { name: 'apellidoNombreComprador', type: 'string', length: 30 },
        { name: 'importeTotalOperacion', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importeTotalConceptosNoGravado', type: 'decimal', decimals: 2, length: 15, default: 0 },
        { name: 'percepcionNoCategorizados', type: 'decimal', decimals: 2, length: 15, default: 0 },
        { name: 'importeOperacionesExentas', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importePercepcionImpuestosNacionales', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importePercepcionIngresosBrutos', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importePercepcionImpuestosMunicipales', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importeImpuestosInternos', type: 'decimal', decimals: 2, length: 15 },
        { name: 'codigoMoneda', type: 'string', length: 3, default: 'PES' },
        { name: 'tipoCambio', type: 'decimal', decimals: 6, length: 10, default: 1 },
        { name: 'cantidadAlicuotasIva', type: 'integer', length: 1 },
        { name: 'codigoOperacion', type: 'string', length: 1, default: '0' },
        { name: 'otrosTributos', type: 'integer', length: 15 },
        { name: 'fechaVencimientoPago', type: 'decimal', decimals: 2, length: 15, default: 0 }
      ],

      alicuotas: [
        { name: 'tipo', type: 'integer', length: 3 },
        { name: 'puntoVenta', type: 'integer', length: 5 },
        { name: 'numeroComprobante', type: 'integer', length: 20 },
        { name: 'importeNetoGravado', type: 'decimal', decimals: 2, length: 15 },
        { name: 'alicuotaIva', type: 'integer', length: 4 },
        { name: 'impuestoLiquidado', type: 'decimal', decimals: 2, length: 15 }
      ]
    };

    return {
      convertir: ventas => {
        ventas.forEach(c => {
          c.codigoDocumentoComprador = _.isNil(c.numeroIdentificacionComprador) ? TIPOS_DE_DOCUMENTO.CONSUMIDOR_FINAL : TIPOS_DE_DOCUMENTO.CUIT;

          const alicuotas = _.pickBy(c, (value, key) => key.startsWith('iva'));
          c.alicuotas = _.map(alicuotas, (monto, tipo) => {
            return {
              alicuotaIva: TIPOS_DE_ALICUOTA[tipo],
              impuestoLiquidado: monto,
              importeNetoGravado: c[_.camelCase(`base ${tipo}`)]
            }
          });
        });

        const datos = {
          comprobantes: _.map(ventas, x => _.extend(x, {
            cantidadAlicuotasIva: x.alicuotas.length,
            tipo: TIPOS_DE_COMPROBANTE[x.tipo]
          })),
          alicuotas: _.flatMap(ventas, comprobante => comprobante.alicuotas.map(x => _.extend(x, _.omit(comprobante, 'alicuotas'))))
        };

        return _.mapValues(formatos, (x, tipo) => new FixedLengthBuilder(x).build(datos[tipo], true));
      }
    };
  });
