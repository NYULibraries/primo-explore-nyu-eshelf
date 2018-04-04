const nyuEshelfConfig = __fixtures__['nyuEshelfConfig'];

describe('nyuEshelf component', () => {

  let spies;
  beforeEach(() => {
    spies = {
      initEshelf() {},
      checkEshelf() {},
      generateRequest() {},
      failure() {},
      success() {}
    };
    spyOn(spies, 'initEshelf');
    spyOn(spies, 'checkEshelf');
    spyOn(spies, 'generateRequest');
    spyOn(spies, 'failure');
    spyOn(spies, 'success');
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
            ...spies
          })
        );
  }));

  let element;
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    const $compile = _$compile_;
    const $rootScope = _$rootScope_;
    const $scope = $rootScope.$new();


    const primoExploreCtrl = {
      userSessionManagerService: {
        isGuest() { return false; }
      }
    };

    const prmSearchResultAvailabilityLineCtrl = { result: {
        pnx: {
          control: {
            recordid: ['abcd123']
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

  describe('has an element', () => {
    it('should...', () => {
      element;
    });
  });
});
