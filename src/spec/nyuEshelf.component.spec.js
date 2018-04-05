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

  let element;
  const elementId = 'abcd123';
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    const $compile = _$compile_;
    const $rootScope = _$rootScope_;
    const $scope = $rootScope.$new();

    // by default, the user is logged in
    const primoExploreCtrl = {
      userSessionManagerService: {
        isGuest() { return false; }
      }
    };

    const prmSearchResultAvailabilityLineCtrl = {
      result: {
        pnx: {
          control: {
            recordid: [elementId]
          }
        }
      }
    };

    element = angular.element(`<div><nyu-eshelf /></div>`);
    element.data('$primoExploreController', primoExploreCtrl);
    element.data('$prmSearchResultAvailabilityLineController', prmSearchResultAvailabilityLineCtrl);

    element = $compile(element)($scope).find('nyu-eshelf');
    $scope.$digest();
  }));

  describe('template layout', () => {
    it('should be inside a single div element', () => {
      expect(element.length).toEqual(1);
      const divs = element.find('div');
      expect(divs.length).toEqual(1);
    });

    it('should have span with ng-bind-html directive set to setElementText', () => {
      const span = element.find('span')[0];
      expect(span.getAttribute("ng-bind-html")).toEqual("setElementText()");
    });

    describe('checkbox', () => {
      let checkbox;
      beforeEach(() => {
        checkbox = element.find('input')[0];
      });

      it('should include a checkbox input', () => {
        expect(checkbox.getAttribute('type')).toEqual('checkbox');
      });

      it('should have ng-click directive to eshelfCheckBoxTrigger', () => {
        expect(checkbox.getAttribute("ng-click")).toEqual("eshelfCheckBoxTrigger()");
      });

      it('should have disabled directive', () => {
        expect(checkbox.getAttribute("ng-disabled")).toEqual("disabled");
      });

      it('should have data attribute to record ID', () => {
        expect(checkbox.getAttribute("data-eshelf-external-id")).toEqual(elementId);
      });
      it('should have ng-checked directive set to model inEshelf', () => {
        expect(checkbox.getAttribute("ng-checked")).toEqual("inEshelf");
      });
    });
  });
});
