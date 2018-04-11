export default function(nyuEshelfService, config, $scope) {

  this.$onInit = () => {
    $scope.loggedIn = !this.primoExploreCtrl.userSessionManagerService.isGuest();
    $scope.myEshelfButtonClasses = config.myEshelfButtonClasses;
    $scope.elementText = $scope.loggedIn ? config.myEshelf : config.guestEshelf;
    $scope.eshelfUrl = config.envConfig.eshelfBaseUrl + "/?institution=" + config.envConfig.institution;
  };

  $scope.openEshelf = () => {
    window.open($scope.eshelfUrl, '_blank');
  };
}
