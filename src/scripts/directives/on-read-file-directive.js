
angular
  .module('classroom')
  .directive('onReadFile', function($parse) {
    return {
      restrict: 'A',
      scope: false,
      link: (scope, element, attrs) => {
      const fn = $parse(attrs.onReadFile);
        return element.on('change', function(onChangeEvent) {
          var reader;
          reader = new FileReader();
          reader.onload = function(onLoadEvent) {
            return scope.$apply(function() {
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
