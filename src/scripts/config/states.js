
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
    .state('classroom.home', {
      url: '/',
      authenticated: false,
      views: {
        'content@classroom': {
          templateUrl: 'views/home.html'
        }
      }
    });

    $urlRouterProvider.otherwise('/')
  });
