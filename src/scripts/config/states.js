
angular
  .module('classroom')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('classroom', {
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
    })
    .state('classroom.main', {
      url: '/',
      authenticated: false,
      views: {
        'content@classroom': {
          templateUrl: 'views/main.html',
          controller: 'MainController'
        }
      }
    })
    .state('classroom.main.maestro', {
      templateUrl: 'views/main-maestro.html'
    })
    .state('classroom.main.resultado', {
      templateUrl: 'views/main-resultado.html'
    });

    $urlRouterProvider.otherwise('/')
  });
