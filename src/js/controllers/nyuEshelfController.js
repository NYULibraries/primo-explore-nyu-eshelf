export default function(nyuEshelfService, config, $rootScope, $scope, $http, $location, $window) {
  const ctrl = this;

  this.$onInit = () => {
    // Primo ID
    $scope.externalId = ctrl.prmSearchResultAvailabilityLineCtrl.result.pnx.control.recordid[0];
    $scope.elementId = "eshelf_" + $scope.externalId + ((ctrl.prmSearchResultAvailabilityLineCtrl.isFullView) ? "_full" : "_brief");
    // JSON that eshelf is expecting
    $scope.recordData = { "record": { "external_system": "primo", "external_id": $scope.externalId }};
    // Determine if we're logged into Primo/PDS
    nyuEshelfService.loggedIn = !ctrl.primoExploreCtrl.userSessionManagerService.isGuest();
    // Determine what text to show if the record is in eshelf based on logged in status
    // Build the pds url
    $scope.pdsUrl = config.envConfig.pdsUrl.base + "?func=load-login&calling_system=" + config.envConfig.pdsUrl.callingSystem + "&institute=" + config.envConfig.institution + "&url=" + config.primoBaseUrl + "/primo_library/libweb/pdsLogin?targetURL=" + $window.encodeURIComponent($location.absUrl()) + "&from-new-ui=1&authenticationProfile=BASE_PROFILE";
    // Disable the input if there is an error or the process is running
    $scope.disabled = Boolean(!nyuEshelfService.intialized || nyuEshelfService[$scope.externalId+'_error'] || $scope.running);
    // In eshelf?
    $scope.inEshelf = Boolean(nyuEshelfService[$scope.externalId]);

    const inGuestText = config.inGuestEshelf +
      ((config.loginToSave && config.loginToSave != '') ?
        " (<a href=\"" + $scope.pdsUrl + "\">" + config.loginToSave + "</a>)"
        : '');

    $scope.inEshelfText = nyuEshelfService.loggedIn ? config.inEshelf : inGuestText;
  };
  // Determine what text to show based on running status of the http call
  $scope.setElementText = () => {
    if (nyuEshelfService[$scope.externalId+'_error'] || !nyuEshelfService.initialized) {
      return config.error;
    } else if (nyuEshelfService[$scope.externalId]) {
      return $scope.running ? config.deleting : $scope.inEshelfText;
    } else {
      return $scope.running ? config.adding : config.addToEshelf;
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
  $scope.toggleInEshelf = (httpMethod) => {
    const request = nyuEshelfService.generateRequest(httpMethod, $scope.recordData);
    $http(request)
      .then(
        function(response) { $scope.running = false; nyuEshelfService.success(response, $scope.externalId); },
        function(response) { nyuEshelfService.failure(response, $scope.externalId); }
      );
  };
}
