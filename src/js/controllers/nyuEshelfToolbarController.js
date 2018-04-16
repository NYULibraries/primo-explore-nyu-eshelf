export default function(config, $scope) {

  this.$onInit = () => {
    $scope.myEshelfButtonClasses = config.myEshelfButtonClasses;
    $scope.eshelfUrl = config.envConfig.eshelfBaseUrl + "/?institution=" + config.envConfig.institution;
    $scope.toolbar = config.toolbar;
  };

  $scope.openEshelf = () => {
    window.open($scope.eshelfUrl, '_blank');
  };
}
