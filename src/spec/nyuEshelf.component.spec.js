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
    $provide.service('nyuEshelfConfigService', () => nyuEshelfConfig);
    $provide.service('nyuEshelfService', () => ({
      initialized: false,
      csrfToken: '',
      loggedIn: false,
      ...spies
    }));
  }));

  let element;
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    const $compile = _$compile_;
    const $rootScope = _$rootScope_;
    const $scope = $rootScope.$new();

    const primoExploreCtrl = {};
    const prmSearchResultAvailabilityLineCtrl = {};

    element = angular.element(`<div><nyu-eshelf /></div>`);
    element.data('$primoExploreController', primoExploreCtrl);
    element.data('$prmSearchResultAvailabilityLineController', prmSearchResultAvailabilityLineCtrl);

    element = $compile(element)($scope).find('nyu-eshelf');
    $scope.$digest();
  }));

  describe('has an element', () => {
    it('should...', () => {
      element;
      console.log(element.html());
    });
  });
});
