const nyuEshelfConfig = __fixtures__['nyuEshelfConfig'];

describe('nyuEshelf component', () => {
  let mockServiceSpies;
  beforeEach(() => {
    mockServiceSpies = {
      initEshelf() {},
      checkEshelf() {},
      generateRequest() {},
      failure() {},
      success() {}
    };
  });

  beforeEach(module('nyuEshelf', function($provide) {
    $provide.service('nyuEshelfConfigService', () => {
      const config = angular.copy(nyuEshelfConfig);
      config.primoBaseUrl = "http://www.example.com:8080";
      config.envConfig = config.defaultUrls;
      return config;
    });

    // mocks http to do nothign to avoid warnings
    const mockHttp = (request) => new Promise((resolve, reject) => {});
    $provide.service('$http', () => mockHttp);

    $provide.service('nyuEshelfService', ($http) => ({
        initialized: false,
        csrfToken: '',
        loggedIn: false,
        ...mockServiceSpies
      })
    );
  }));

  let element, $scope, $compile;
  const elementId = 'abcd123';
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    const $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    // by default, the user is logged in
    const primoExploreCtrl = {
      userSessionManagerService: {
        isGuest() { return false; }
      }
    };

    element = angular.element(`<div><nyu-eshelf-toolbar /></div>`);
    element.data('$primoExploreController', primoExploreCtrl);

    element = $compile(element)($scope).find('nyu-eshelf-toolbar');
    $scope.$digest();
  }));

  describe('template layout', () => {

    let button;
    beforeEach(() => {
      button = element.find('md-button')[0];
    });

    it('should be a single md-button', () => {
      expect(element.length).toEqual(1);
      expect(button.tagName).toEqual("MD-BUTTON");
    });

    it('should have ng-click directive to openEshelf()', () => {
      const ngClick = button.getAttribute('ng-click');
      expect(ngClick).toEqual("openEshelf()");
    });

    it('should add the config classes to the button', () => {
      const classes = button.className;
      expect(classes).toContain(nyuEshelfConfig.myEshelfButtonClasses);
    });

    it('should render appropriate elementText when logged in', () => {
      expect(element.html()).toContain(nyuEshelfConfig.myEshelf);
    });

    it('should render appropriate elementText text when guest', () => {
      inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        const $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        const primoExploreCtrl = {
          userSessionManagerService: {
            isGuest() { return true; } // change to guest
          }
        };

        element = angular.element(`<div><nyu-eshelf-toolbar /></div>`);
        element.data('$primoExploreController', primoExploreCtrl);

        element = $compile(element)($scope).find('nyu-eshelf-toolbar');
        $scope.$digest();
      });

      expect(element.html()).toContain(nyuEshelfConfig.guestEshelf);
    });

  });
});
