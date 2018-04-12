const nyuEshelfConfig = __fixtures__['nyuEshelfConfig'];

describe('nyuEshelfToolbarController', () => {
  let mockServiceSpies;
  beforeEach(() => {
    mockServiceSpies = {
      initEshelf() {},
      generateRequest() {},
      failure() {},
      success() {}
    };
  });

  let config;
  beforeEach(module('nyuEshelf', function($provide) {

    $provide.service('nyuEshelfConfigService', () => {
      config = angular.copy(nyuEshelfConfig);
      config.primoBaseUrl = "http://www.example.com:8080";
      config.envConfig = config.defaultUrls;
      return config;
    });

    // Mocks $http to do nothing to avoid warnings. Http request tests handled in services.
    const mockHttp = (req) => new Promise((res, rej) => {});
    $provide.service('$http', () => mockHttp);

    $provide.service('nyuEshelfService', () => ({
        initialized: false,
        csrfToken: '',
        loggedIn: false,
        ...mockServiceSpies
      })
    );
  }));

  let $scope, $componentController;
  let controller, bindings;
  beforeEach(inject(function(_$rootScope_, _$componentController_) {
    $scope = _$rootScope_;
    $componentController = _$componentController_;

    const primoExploreCtrl = {
      userSessionManagerService: {
        isGuest: () => false // default user is logged in
      }
    };

    bindings = {
      primoExploreCtrl,
    };

    controller = $componentController(
      'nyuEshelfToolbar',
      { $scope },
      bindings
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
