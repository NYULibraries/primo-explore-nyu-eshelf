export default function(nyuEshelfService, config, $scope) {

  this.$onInit = () => {
    $scope.myEshelfButtonClasses = config.myEshelfButtonClasses;
    $scope.eshelfUrl = config.envConfig.eshelfBaseUrl + "/?institution=" + config.envConfig.institution;
  };

  $scope.openEshelf = () => {
    window.open($scope.eshelfUrl, '_blank');
  };
}
