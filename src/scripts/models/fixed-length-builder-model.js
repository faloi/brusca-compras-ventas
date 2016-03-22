
angular
  .module('classroom')
  .factory('FixedLengthBuilder', function () {

    class FixedLengthBuilder {
      constructor(format, delimiter) {
        this.format = format;
        this.delimiter = delimiter || '\r\n';
        this.converters = {
          date: {
            parse: moment,
            convert: (value, column) => value.format('YYYYMMDD')
          },
          integer: {
            parse: x => _.isNil(x) ? 0 : parseInt(x),
            convert: (value, column) => _.padStart(value, column.length, '0')
          },
          string: {
            parse: _.identity,
            convert: (value, column) => _.padEnd(value, column.length)
          },
          decimal: {
            parse: numeral().unformat,
            convert: (value, column) => {
              const moverSignoMenosAlPrincipio = (numString) => '-' + numString.replace('-', '');

              let toString = _.padStart(value.toFixed(column.decimals).replace('.', ''), column.length, '0');
              return value < 0 ? moverSignoMenosAlPrincipio(toString) : toString;
            }
          }
        };
      }

      build(objects, deburr) {
        const transform = deburr ? _.deburr : _.identity;
        return transform(objects.map(this._buildOne, this).join(this.delimiter));
      }

      _buildOne(obj) {
        const mapColumn = (column) => {
          const value = _.isNil(obj[column.name]) ? column.default : obj[column.name];
          return this._padValue(value, column).substr(0, column.length);
        };

        return this.format.map(mapColumn).join('');
      }

      _padValue(value, column) {
        const converter = this.converters[column.type];
        return converter.convert(converter.parse(value), column);
      }
    }

    return FixedLengthBuilder;

  });
