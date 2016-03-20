
angular
  .module('classroom')
  .service('ConversorCompra', function(FixedLengthBuilder, TIPOS_DE_ALICUOTA, TIPOS_DE_COMPROBANTE, TIPOS_DE_DOCUMENTO) {
    const formatos = {
      comprobantes: [
        { name: 'fecha', type: 'date', length: 8 },
        { name: 'tipo', type: 'integer', length: 3 },
        { name: 'puntoVenta', type: 'integer', length: 5 },
        { name: 'numeroComprobante', type: 'integer', length: 20 },
        { name: 'numeroDespachoImportacion', type: 'string', length: 16, default: '' },
        { name: 'codigoDocumentoVendedor', type: 'integer', length: 2, default: TIPOS_DE_DOCUMENTO.CUIT },
        { name: 'numeroIdentificacionVendedor', type: 'integer', length: 20 },
        { name: 'apellidoNombreVendedor', type: 'string', length: 30 },
        { name: 'importeTotalOperacion', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importeTotalConceptosNoGravado', type: 'decimal', decimals: 2, length: 15, default: 0 },
        { name: 'importeOperacionesExentas', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importePercepcionIva', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importePercepcionOtrosImpuestos', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importePercepcionIngresosBrutos', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importePercepcionImpuestosMunicipales', type: 'decimal', decimals: 2, length: 15 },
        { name: 'importeImpuestosInternos', type: 'decimal', decimals: 2, length: 15 },
        { name: 'codigoMoneda', type: 'string', length: 3, default: 'PES' },
        { name: 'tipoCambio', type: 'decimal', decimals: 6, length: 10, default: 1 },
        { name: 'cantidadAlicuotasIva', type: 'integer', length: 1 },
        { name: 'codigoOperacion', type: 'string', length: 1, default: '0' },
        { name: 'creditoFiscalComputable', type: 'integer', length: 15, default: 0 },
        { name: 'otrosTributos', type: 'integer', length: 15 },
        { name: 'cuitEmisor', type: 'integer', length: 11, default: 0 },
        { name: 'denominacionEmisor', type: 'string', length: 30, default: '' },
        { name: 'ivaComision', type: 'decimal', decimals: 2, length: 15, default: 0 }
      ],

      alicuotas: [
        { name: 'tipo', type: 'integer', length: 3 },
        { name: 'puntoVenta', type: 'integer', length: 5 },
        { name: 'numeroComprobante', type: 'integer', length: 20 },
        { name: 'codigoDocumentoVendedor', type: 'integer', length: 2, default: 80 },
        { name: 'numeroIdentificacionVendedor', type: 'integer', length: 20 },
        { name: 'importeNetoGravado', type: 'decimal', decimals: 2, length: 15 },
        { name: 'alicuotaIva', type: 'integer', length: 4 },
        { name: 'impuestoLiquidado', type: 'decimal', decimals: 2, length: 15 }
      ]
    };

    return {
      convertir: compras => {
        compras.forEach(c => {
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
          comprobantes: _.map(compras, x => _.extend(x, {
            cantidadAlicuotasIva: x.alicuotas.length,
            tipo: TIPOS_DE_COMPROBANTE[x.tipo]
          })),
          alicuotas: _.flatMap(compras, comprobante => comprobante.alicuotas.map(x => _.extend(x, _.omit(comprobante, 'alicuotas'))))
        };

        return _.mapValues(formatos, (x, tipo) => new FixedLengthBuilder(x).build(datos[tipo], true));
      }
    };
  });
