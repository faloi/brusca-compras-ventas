
angular
  .module('classroom')
  .controller('NavbarController', function ($scope, $state) {
    $scope.$state = $state;
  });
