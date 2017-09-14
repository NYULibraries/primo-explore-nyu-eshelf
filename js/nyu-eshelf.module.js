angular.module('nyuEshelf', [])
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
    pdsUrl: {
      base: 'https://pdsdev.library.nyu.edu/pds',
      callingSystem: 'primo',
      institution: 'NYU-NUI'
    },
    eshelfBaseUrl: 'https://qa.eshelf.library.nyu.edu'
  })
  .factory('nyuEshelfConfigService', ['nyuEshelfConfigDefaults', 'nyuEshelfConfig', function(defaults, config) {
    // Merge default config values with local configs
    // Note: Be aware that angular.merge is deprecated and will not work in > 2
    return angular.merge(defaults, config);
  }])
  .factory('nyuEshelfService', ['nyuEshelfConfigService', '$http', (config, $http) => {
    return {
      initialized: false,
      csrfToken: '',
      loggedIn: false,
      initEshelf: function() {
        let url = config.eshelfBaseUrl + "/records/from/primo.json?per=all&_=" + Date.now();
        let svc = this;
        $http.get(url).then(
          function(response){
            if (response.headers('x-csrf-token')) {
              svc.csrfToken = response.headers('x-csrf-token');
              svc.initialized = true;
            }
          },
          function(response){
            console.log("Error in e-Shelf CORS API");
            console.log("Response: " + response);
          }
        );
      },
      checkEshelf: function(externalId) {
        let url = config.eshelfBaseUrl + "/records/from/primo.json?per=all&external_id[]=" + externalId;
        let svc = this;
        $http.get(url).then(
            function(response){
              if (response.data.length > 0) {
                if (response.data.filter(item => item["external_id"] == externalId)) {
                  svc[externalId] = true;
                }
              }
            },
            function(response){
              svc[externalId+'_error'] = true;
            }
         );
      },
      generateRequest: function(httpMethod, data) {
        if (!/^(DELETE|POST)$/.test(httpMethod.toUpperCase())) {
          return {};
        }
        let headers = { 'X-CSRF-Token': this.csrfToken, 'Content-type': 'application/json;charset=utf-8' }
        let request = {
          method: httpMethod.toUpperCase(),
          url: config.eshelfBaseUrl + "/records.json",
          headers: headers,
          data: data
        }
        return request;
      },
      failure: function(response, externalId) {
        this[externalId+'_error'] = true;
      },
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
  .run(['nyuEshelfService', function(nyuEshelfService){
    // Initialize eshelf session and get CSRF-Token
    if (!nyuEshelfService.initialized) {
      nyuEshelfService.initEshelf();
    }
  }])
  .controller('nyuEshelfController', ['nyuEshelfService', 'nyuEshelfConfigService', '$rootScope', '$scope', '$http', '$location', '$window', function(nyuEshelfService, config, $rootScope, $scope, $http, $location, $window) {
    this.$onInit = function() {
      $scope.externalId = this.prmSearchResultAvailabilityLine.result.pnx.control.recordid[0];
      $scope.elementId = "eshelf_" + $scope.externalId + ((this.prmSearchResultAvailabilityLine.isFullView) ? "_full" : "_brief");

      $scope.recordData = { "record": { "external_system": "primo", "external_id": $scope.externalId }};
      nyuEshelfService.loggedIn = !this.prmBriefResultContainer.userSessionManagerService.isGuest();
      nyuEshelfService.checkEshelf($scope.externalId);
    };

    $scope.inEshelfText = function() {
      if (nyuEshelfService.loggedIn) {
        return config.inEshelf;
      } else {
        return config.inGuestEshelf + ((config.loginToSave && config.loginToSave != '') ? " (<a href=\"" + $scope.pdsUrl() + "\">" + config.loginToSave + "</a>)" : '');
      }
    };

    $scope.pdsUrl = function() {
      return config.pdsUrl.base + "?func=load-login&calling_system=" + config.pdsUrl.callingSystem + "&institute=" + config.pdsUrl.institution + "&url=http://bobcatdev.library.nyu.edu:80/primo_library/libweb/pdsLogin?targetURL=" + $window.encodeURIComponent($location.absUrl()) + "&from-new-ui=1&authenticationProfile=BASE_PROFILE";
    };

    $scope.setElementText = function() {
      if (nyuEshelfService[$scope.externalId+'_error']) { return config.error; }
      if (nyuEshelfService[$scope.externalId]) {
        return ($scope.running) ? config.deleting : $scope.inEshelfText();
      } else {
        return ($scope.running) ? config.adding : config.addToEshelf;
      }
    };

    $scope.disabled = () => (nyuEshelfService[$scope.externalId+'_error'] || $scope.running);
    $scope.inEshelf = () => (nyuEshelfService[$scope.externalId] == true);
    $scope.eshelfCheckBoxTrigger = () => {
      ($scope.inEshelf()) ? $scope.removeFromEshelf() : $scope.addToEshelf();
    };
    $scope.addToEshelf = () => { $scope.toggleInEshelf('post') };
    $scope.removeFromEshelf = () => { $scope.toggleInEshelf('delete') };
    $scope.toggleInEshelf = function(httpMethod) {
      $http(nyuEshelfService.generateRequest(httpMethod, $scope.recordData))
        .then(
          function(response) { $scope.running = false; nyuEshelfService.success(response, $scope.externalId) },
          function(response) { nyuEshelfService.failure(response, $scope.externalId) }
        );
    };

  }])
  .component('nyuEshelf', {
    controller: 'nyuEshelfController',
    require: {
      prmSearchResultAvailabilityLine: '^prmSearchResultAvailabilityLine',
      prmBriefResultContainer: '^prmBriefResultContainer'
    },
    template: '<div class="nyu-eshelf"><button class="neutralized-button md-button md-primoExplore-theme" aria-label="Toggle in e-Shelf">' +
      '<input ng-checked="inEshelf()" ng-disabled="disabled()" id="{{ elementId }}" type="checkbox" data-eshelf-external-id="{{ externalId }}" ng-click="running = true; eshelfCheckBoxTrigger()" >' +
      '<label for="{{ elementId }}"><span ng-bind-html="setElementText()"></span></label>' +
    '</button></div>'
  })
  .controller('nyuEshelfToolbarController', ['nyuEshelfConfigService', '$scope', '$filter', function(config, $scope, $filter) {
    this.$onInit = function() {
      $scope.loggedIn = !this.prmExploreMain.skipToService.userSessionManagerService.isGuest();
      $scope.myEshelfButtonClasses = config.myEshelfButtonClasses;
    };
    $scope.openEshelf = function() {
      window.open($filter('translate')('urls.eshelf'), '_blank');
    };
    $scope.elementText = () => ($scope.loggedIn) ? config.myEshelf : config.guestEshelf;
  }])
  .component('nyuEshelfToolbar', {
    controller: 'nyuEshelfToolbarController',
    require: {
      prmExploreMain: '^prmExploreMain'
    },
    template: '<button class="button-with-icon zero-margin md-button md-primoExplore-theme md-ink-ripple {{myEshelfButtonClasses}}" type="button" aria-label="Go to {{elementText()}}" ng-click="openEshelf()">'+
                '<prm-icon style="z-index:1" icon-type="svg" svg-icon-set="image" icon-definition="ic_collections_bookmark_24px" aria-label="Go to {{elementText()}}"></prm-icon>'+
                '<span class="hide-xs">{{elementText()}}</span>'+
              '</button>'
  });
