const nyuEshelfConfig = __fixtures__['nyuEshelfConfig'];

describe('nyuEshelfToolbarController', () => {
  let config;
  beforeEach(module('nyuEshelf', function($provide) {
    $provide.service('nyuEshelfConfigService', () => {
      config = angular.copy(nyuEshelfConfig);
      config.primoBaseUrl = "http://www.example.com:8080";
      config.envConfig = config.defaultUrls;
      return config;
    });
  }));

  let $scope, $componentController;
  let controller;
  beforeEach(inject(function(_$rootScope_, _$componentController_) {
    $scope = _$rootScope_;
    $componentController = _$componentController_;

    controller = $componentController(
      'nyuEshelfToolbar',
      { $scope }
    );
    controller.$onInit();
  }));

  describe('$onInit', () => {
    beforeEach(() => {
    });

    it('should assign myEshelfButtonClasses', () => {
      expect($scope.myEshelfButtonClasses).toEqual(config.myEshelfButtonClasses);
    });

    it('should assign appropriate elementText', () => {
      expect($scope.elementText).toEqual(config.myEshelf);
    });

    it('should assign eshelfUrl', () => {
      const url = config.envConfig.eshelfBaseUrl + "/?institution=" + config.envConfig.institution;
      expect($scope.eshelfUrl).toEqual(url);
    });

    describe('$scope.openEshelf', () => {

      beforeEach(() => {
        spyOn(window, 'open');
      });

      it('should be defined', () => {
        expect($scope.openEshelf).toBeDefined();
      });

      it('should open the eshelfUrl in a new window', () => {
        const url = config.envConfig.eshelfBaseUrl + "/?institution=" + config.envConfig.institution;
        $scope.openEshelf();
        expect(window.open).toHaveBeenCalledWith(url, '_blank');
      });
    });
  });

});
