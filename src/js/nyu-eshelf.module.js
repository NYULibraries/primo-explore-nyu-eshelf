import nyuEshelfTemplate from '../html/nyuEshelf.html';
import nyuEshelfToolbarTemplate from '../html/nyuEshelfToolbar.html';

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
  .constant('nyuEshelfConfigDefaults', {
    myEshelfButtonClasses: 'button-over-dark',
    myEshelf: 'My e-Shelf',
    guestEshelf: 'Guest e-Shelf',
    addToEshelf: "Add to e-Shelf",
    inEshelf: "In e-Shelf",
    inGuestEshelf: "In guest e-Shelf",
    loginToSave: "login to save permanently",
    adding: "Adding to e-Shelf...",
    deleting: "Removing from e-Shelf...",
    error: "Could not connect to e-Shelf",
    defaultUrls: {
      pdsUrl: {
        base: 'https://pdsdev.library.nyu.edu/pds',
        callingSystem: 'primo'
      },
      eshelfBaseUrl: 'https://qa.eshelf.library.nyu.edu',
      institution: 'NYU'
    },
    "bobcat.library.nyu.edu": {
      pdsUrl: {
        base: 'https://pds.library.nyu.edu/pds',
        callingSystem: 'primo'
      },
      eshelfBaseUrl: 'https://eshelf.library.nyu.edu',
      institution: 'NYU'
    }
  })
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
  .factory('nyuEshelfService', ['nyuEshelfConfigService', '$http', (config, $http) => {
    return {
      initialized: false, // Is the csrfToken initialized on first load of the page?
      csrfToken: '', // Storage spot for the csrfToken
      loggedIn: false, // Are we logged in?,
      // Make an initial call to eshelf to find out if any of the current
      // records are already in our eshelf and geet the first csrfToken
      initEshelf: function() {
        let svc = this; // For maintaining service scoping in the function below
        // Eshelf API to setup csrfToken and avoid that pesky cache
        let url = config.envConfig.eshelfBaseUrl + "/records/from/primo.json?per=all&_=" + Date.now();
        // Get the csrfToken already
        $http.get(url).then(
          function(response){
            if (response.headers('x-csrf-token')) {
              svc.csrfToken = response.headers('x-csrf-token');
              svc.initialized = true;
            }
          },
          // Oops
          function(response){
            console.error("Error in e-Shelf CORS API");
            console.error("Response: " + response);
          }
        );
      },
      // Check eshelf for existing externalId
      checkEshelf: function(externalId) {
        // Use eshelf API to check if record with externalId is in current user's eshelf
        let url = config.envConfig.eshelfBaseUrl + "/records/from/primo.json?per=all&external_id[]=" + externalId;
        let svc = this; // For maintaining service scoping in the function below
        $http.get(url).then(
            function(response){
              if (response.data.length > 0) {
                if (response.data.filter(item => item["external_id"] == externalId)) {
                  // If we found the externalId in the response set that
                  // id on the service object to true so we can reference it later
                  svc[externalId] = true;
                }
              }
            },
            // Oops, set an error object
            function(_response){
              svc[externalId+'_error'] = true;
            }
         );
      },
      // Generate a generic http request for the different types of calls to eshelf
      generateRequest: function(httpMethod, data) {
        // Whitelist http methods DELETE and POST
        if (!/^(DELETE|POST)$/.test(httpMethod.toUpperCase())) {
          return {};
        }
        // Cors headers
        let headers = { 'X-CSRF-Token': this.csrfToken, 'Content-type': 'application/json;charset=utf-8' };
        let request = {
          method: httpMethod.toUpperCase(),
          url: config.envConfig.eshelfBaseUrl + "/records.json",
          headers: headers,
          data: data
        };
        return request;
      },
      failure: function(_response, externalId) {
        this[externalId+'_error'] = true;
      },
      // Set the new csrfToken to the response header on success
      success: function(response, externalId) {
        if (response.headers('x-csrf-token')) {
          this.csrfToken = response.headers('x-csrf-token');
        }

        if (response.status == 201) {
          this[externalId] = true;
        } else {
          delete this[externalId];
        }
      }
    };
  }])
  // Controller for the eshelf input form component
  .controller('nyuEshelfController', ['nyuEshelfService', 'nyuEshelfConfigService', '$rootScope', '$scope', '$http', '$location', '$window', function(nyuEshelfService, config, $rootScope, $scope, $http, $location, $window) {
    const ctrl = this;

    this.$onInit = function() {
      // Primo ID
      $scope.externalId = ctrl.prmSearchResultAvailabilityLineCtrl.result.pnx.control.recordid[0];
      $scope.elementId = "eshelf_" + $scope.externalId + ((ctrl.prmSearchResultAvailabilityLineCtrl.isFullView) ? "_full" : "_brief");
      // JSON that eshelf is expecting
      $scope.recordData = { "record": { "external_system": "primo", "external_id": $scope.externalId }};
      // Determine if we're logged into Primo/PDS
      nyuEshelfService.loggedIn = !ctrl.primoExploreCtrl.userSessionManagerService.isGuest();
      // Check if this record is in eshelf
      nyuEshelfService.checkEshelf($scope.externalId);
      // Determine what text to show if the record is in eshelf based on logged in status
      // Build the pds url
      $scope.pdsUrl = config.envConfig.pdsUrl.base + "?func=load-login&calling_system=" + config.envConfig.pdsUrl.callingSystem + "&institute=" + config.envConfig.institution + "&url=" + config.primoBaseUrl + "/primo_library/libweb/pdsLogin?targetURL=" + $window.encodeURIComponent($location.absUrl()) + "&from-new-ui=1&authenticationProfile=BASE_PROFILE";
      // Disable the input if there is an error or the process is running
      $scope.disabled = Boolean(nyuEshelfService[$scope.externalId+'_error'] || $scope.running);
      // In eshelf?
      $scope.inEshelf = Boolean(nyuEshelfService[$scope.externalId]);

      const inGuestText = config.inGuestEshelf +
        ((config.loginToSave && config.loginToSave != '') ?
          " (<a href=\"" + $scope.pdsUrl + "\">" + config.loginToSave + "</a>)"
          : '');

      $scope.inEshelfText = nyuEshelfService.loggedIn ? config.inEshelf : inGuestText;
    };
    // Determine what text to show based on running status of the http call
    $scope.setElementText = function() {
      if (nyuEshelfService[$scope.externalId+'_error']) { return config.error; }
      if (nyuEshelfService[$scope.externalId]) {
        return ($scope.running) ? config.deleting : $scope.inEshelfText;
      } else {
        return ($scope.running) ? config.adding : config.addToEshelf;
      }
    };
    // Toggle the \ function on the input element
    $scope.eshelfCheckBoxTrigger = () => {
      $scope.running = true;
      ($scope.inEshelf) ? $scope.removeFromEshelf() : $scope.addToEshelf();
    };
    // Alias to add
    $scope.addToEshelf = () => { $scope.toggleInEshelf('post'); };
    // Alias to delete
    $scope.removeFromEshelf = () => { $scope.toggleInEshelf('delete'); };
    // Wrap the generic request
    $scope.toggleInEshelf = function(httpMethod) {
      const request = nyuEshelfService.generateRequest(httpMethod, $scope.recordData);
      $http(request)
        .then(
          function(response) { $scope.running = false; nyuEshelfService.success(response, $scope.externalId); },
          function(response) { nyuEshelfService.failure(response, $scope.externalId); }
        );
    };
  }])
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
  .controller('nyuEshelfToolbarController', ['nyuEshelfService', 'nyuEshelfConfigService', '$scope', function(nyuEshelfService, config, $scope) {

    this.$onInit = function() {
      $scope.loggedIn = !this.primoExploreCtrl.userSessionManagerService.isGuest();
      $scope.myEshelfButtonClasses = config.myEshelfButtonClasses;
      $scope.elementText = $scope.loggedIn ? config.myEshelf : config.guestEshelf;
      $scope.eshelfUrl = config.envConfig.eshelfBaseUrl + "/?institution=" + config.envConfig.institution;
      $scope.openEshelf = function() {
        window.open($scope.eshelfUrl, '_blank');
      };
    };
  }])
  // Setup a new button component to add to the topbar
  .component('nyuEshelfToolbar', {
    controller: 'nyuEshelfToolbarController',
    require: {
      primoExploreCtrl: '^primoExplore'
    },
    template: nyuEshelfToolbarTemplate
  });
