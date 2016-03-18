
angular
  .module('classroom')
  .config((toastrConfig) => {

    angular.extend(toastrConfig, {
      positionClass: 'toast-top-full-width',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });

  });
