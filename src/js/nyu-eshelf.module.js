//html templates
import nyuEshelfTemplate from '../html/nyuEshelf.html';
import nyuEshelfToolbarTemplate from '../html/nyuEshelfToolbar.html';

//controllers
import nyuEshelfController from './controllers/nyueShelfController.js';
import nyuEshelfToolbarController from './controllers/nyuEshelfToolbarController.js';

//services
import nyuEshelfService from './services/nyuEshelfService.js';

//constants
import nyuEshelfConfigDefaults from './constants/nyuEshelfConfigDefaults.js';

angular
  // Name our module
  .module('nyuEshelf', ["ngSanitize"])
  // Set config for using CORS within module
  .config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    //Enable passing of cookies for CORS calls
    //Note: CORS will absolutely not work without this
    $httpProvider.defaults.withCredentials = true;

    //Remove the header containing XMLHttpRequest used to identify ajax call
    //that would prevent CORS from working
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })
  // Constant for the defaults to all config values
  // Can be overriden with nyuEshelfConfig constant
  .constant('nyuEshelfConfigDefaults', nyuEshelfConfigDefaults)
  // Reuseable factory for setting config
  .factory('nyuEshelfConfigService', ['nyuEshelfConfigDefaults', 'nyuEshelfConfig', '$location', function(defaults, config, $location) {
    // Merge default config values with local configs
    // Note: Be aware that angular.merge is deprecated and will not work in > 2
    let mergedConfig = angular.merge(defaults, config);
    // Set primoBaseUrl for pds return script based on current instance
    mergedConfig['primoBaseUrl'] = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    // Setup the environment config based on current host matching config obj
    mergedConfig['envConfig'] = (typeof mergedConfig[$location.host()] === 'undefined') ? mergedConfig.defaultUrls : mergedConfig[$location.host()];
    return mergedConfig;
  }])
  // Reusable factory for initiating an 'add to eshelf' input element
  .factory('nyuEshelfService', ['nyuEshelfConfigService', '$http', nyuEshelfService])
  // Controller for the eshelf input form component
  .controller('nyuEshelfController', ['nyuEshelfService', 'nyuEshelfConfigService', '$rootScope', '$scope', '$http', '$location', '$window', nyuEshelfController])
  // Setup an input element to toggle eshelf
  .component('nyuEshelf', {
    controller: 'nyuEshelfController',
    require: {
      prmSearchResultAvailabilityLineCtrl: '^prmSearchResultAvailabilityLine',
      primoExploreCtrl: '^primoExplore'
    },
    template: nyuEshelfTemplate
  })
  // Controller for topbar 'my eshelf' button
  .controller('nyuEshelfToolbarController', ['nyuEshelfService', 'nyuEshelfConfigService', '$scope', nyuEshelfToolbarController])
  // Setup a new button component to add to the topbar
  .component('nyuEshelfToolbar', {
    controller: 'nyuEshelfToolbarController',
    require: {
      primoExploreCtrl: '^primoExplore'
    },
    template: nyuEshelfToolbarTemplate
  });
