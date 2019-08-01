import nyuEshelfConfig from './fixtures/nyuEshelfConfig';

describe('nyuEshelfToolbar component', () => {
  let mockServiceSpies;
  beforeEach(() => {
    mockServiceSpies = {
      initEshelf() {},
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

    $provide.service('nyuEshelfService', () => ({
        initialized: false,
        csrfToken: '',
        loggedIn: false,
        ...mockServiceSpies
      })
    );
  }));

  let element, $scope, $compile;
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    const $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    element = angular.element(`<nyu-eshelf-toolbar />`);

    element = $compile(element)($scope);
    $scope.$digest();
  }));

  let button;
  beforeEach(() => {
    button = element.find('md-button')[0];
  });

  describe('template layout', () => {

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
  });

  describe('toolbar text', () => {
    it('should contain toolbar text', () => {
      const toolbarText = nyuEshelfConfig.toolbar;
      expect(button.innerText).toContain(toolbarText);
      expect(button.innerText).toContain("Go to " + toolbarText);
    });
  });
});
