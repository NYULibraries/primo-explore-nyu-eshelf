const nyuEshelfConfig = require('./fixtures/nyuEshelfConfig');

describe('nyuEshelfController', () => {

  const recordId = 'abcd123';
  const mockRequestURL = 'eshelf.nyu.edu/';
  const mockData = { "record": { "external_system": "primo", "external_id": recordId } };
  let spies;
  beforeEach(() => {
    spies = {
      initEshelf() {},
      generateRequest: (method, data) => ({
        method,
        url: mockRequestURL,
        headers: {},
        data
      }),
      failure() {},
      success() {},
    };

    spyOn(spies, 'generateRequest').and.callThrough();
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

    $provide.service('nyuEshelfService', () => ({
        initialized: true, // default to intialized true
        csrfToken: '',
        loggedIn: false,
        ...spies
      })
    );
  }));

  let $scope, $componentController, $httpBackend;
  let controller, bindings;
  let nyuEshelfService;
  let eshelfCreateHandler, eshelfDestroyHandler;
  beforeEach(inject(function(_$rootScope_, _$componentController_, _nyuEshelfService_, _$httpBackend_) {
    $scope = _$rootScope_;
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    nyuEshelfService = _nyuEshelfService_;

    const primoExploreCtrl = {
      userSessionManagerService: {
        isGuest() { return false; } // default user is logged in
      }
    };

    const prmSearchResultAvailabilityLineCtrl = {
      isFullView: true,
      result: {
        pnx: {
          control: {
            recordid: [recordId]
          }
        },
      }
    };

    bindings = {
      primoExploreCtrl,
      prmSearchResultAvailabilityLineCtrl
    };

    controller = $componentController(
      'nyuEshelf',
      { $scope },
      bindings
    );

    eshelfCreateHandler = $httpBackend
                            .when('POST', mockRequestURL)
                            .respond( mockData );

    eshelfDestroyHandler = $httpBackend
                            .when('DELETE', mockRequestURL)
                            .respond( mockData );
  }));

  describe('$onInit', () => {

    beforeEach(() => {
      controller.$onInit();
    });

    it('should assign an externalId', () => {
      expect($scope.externalId).toEqual(recordId);
    });

    it('should assign an elementId', () => {
      const elementId = `eshelf_${recordId}` + "_full";
      expect($scope.elementId).toEqual(elementId);
    });

    it('should assign recordData', () => {
      const recordData = {
        record: {
          external_system: "primo",
          external_id: recordId
        }
      };

      expect($scope.recordData).toEqual(recordData);
    });

    it('should assign loggedIn to true in nyuEshelfService when logged in', () => {
      expect(nyuEshelfService.loggedIn).toBe(true);
    });

    it('should assign loggedIn to false in nyuEshelfService when guest', () => {
      const guestBindings = angular.copy(bindings);
      guestBindings.primoExploreCtrl.userSessionManagerService.isGuest = () => true;

      const $guestScope = $scope.$new();

      const guestController = $componentController(
        'nyuEshelf',
        { $scope: $guestScope },
        guestBindings
      );

      guestController.$onInit();
      expect(nyuEshelfService.loggedIn).toBe(false);
    });

    it('should not be disabled normally', () => {
      expect($scope.disabled()).toBe(false);
    });

    it('should be disabled if $scope is running', () => {
      $scope.running = true;
      controller.$onInit();
      expect($scope.disabled()).toBe(true);
    });

    it('should be disabled if an error was found', () => {
      nyuEshelfService[recordId + '_error'] = true;
      controller.$onInit();
      expect($scope.disabled()).toBe(true);
    });

    it('should be disabled if eshelf not initialized', () => {
      nyuEshelfService.initialized = false;
      controller.$onInit();
      expect($scope.disabled()).toBe(true);
    });

    it('should assign inEshelf if in e-shelf', () => {
      nyuEshelfService[recordId] = true;
      controller.$onInit();
      expect($scope.inEshelf()).toBe(true);
    });

  });

  describe('$scope functions', () => {

    it('should have setElementText', () => {
      expect($scope.setElementText).toBeDefined();
    });

    describe('setElementText', () => {

      const { adding, deleting, addToEshelf, inEshelf, inGuestEshelf, error} = nyuEshelfConfig;
      beforeEach(() => {
        controller.$onInit();
      });

      it("should return config's error text if error", () => {
        nyuEshelfService[recordId + '_error'] = true;
        const text = $scope.setElementText();
        expect(text).toEqual(error);
      });

      it("should return config's inEshelfText if in shelf when logged in", () => {
        nyuEshelfService[recordId] = true;
        const text = $scope.setElementText();
        expect(text).toEqual(inEshelf);
      });

      it("should return config's addToEshelfText if not in eshelf", () => {
        const text = $scope.setElementText();
        expect(text).toEqual(addToEshelf);
      });

      describe('when running...', () => {
        beforeEach(() => {
          $scope.running = true;
        });

        it("should return config's deleting text if deleting", () => {
          nyuEshelfService[recordId] = true;
          const text = $scope.setElementText();
          expect(text).toEqual(deleting);
        });

        it("should return config's adding text if adding", () => {
          const text = $scope.setElementText();
          expect(text).toEqual(adding);
        });
      });

      describe('when not logged in', () => {

        let $guestScope;
        beforeEach(() => {
          const guestBindings = angular.copy(bindings);
          guestBindings.primoExploreCtrl.userSessionManagerService.isGuest = () => true;

          $guestScope = $scope.$new();

          const guestController = $componentController(
            'nyuEshelf',
            { $scope: $guestScope },
            guestBindings
          );

          guestController.$onInit();
        });

        it("should return config's inGuestEshelf with link if in shelf", () => {
          nyuEshelfService[recordId] = true;
          const text = $guestScope.setElementText();
          expect(text).toContain(inGuestEshelf);
          expect(text).toContain("login to save permanently");
          expect(text).toContain("a href=");
        });
      }); // end when not logged in
    }); // end setElementText

    describe("addToEshelf", () => {
      afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it("should use nyuEshelfService.generateRequest method", () => {
        controller.$onInit();
        $httpBackend.expectPOST(mockRequestURL);
        $scope.addToEshelf();
        $httpBackend.flush();

        expect(spies.generateRequest).toHaveBeenCalledWith("post", mockData);
      });

      describe('on success', () => {
        beforeEach(() => {
          $httpBackend.expectPOST(mockRequestURL);
          $scope.addToEshelf();
          $httpBackend.flush();
        });

        afterEach(() => {
          $httpBackend.verifyNoOutstandingExpectation();
          $httpBackend.verifyNoOutstandingRequest();
        });

        it('should set $scope.running to false', () => {
          expect($scope.running).toBe(false);
        });

        it('should call nyuEshelfService.success method', () => {
          expect(spies.success).toHaveBeenCalled();
        });
      });

      describe('on failure', () => {

        beforeEach(() => {
          eshelfCreateHandler.respond(401, '');
          $httpBackend.expectPOST(mockRequestURL);
          $scope.addToEshelf();
          $httpBackend.flush();
        });

        afterEach(() => {
          $httpBackend.verifyNoOutstandingExpectation();
          $httpBackend.verifyNoOutstandingRequest();
        });

        it('should call nyuEshelfService.failure method', () => {
          expect(spies.failure).toHaveBeenCalled();
        });
      });

    });

    describe("removeFromEshelf", () => {
      afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it("should use nyuEshelfService.generateRequest method", () => {
        controller.$onInit();
        $httpBackend.expectDELETE(mockRequestURL);
        $scope.removeFromEshelf();
        $httpBackend.flush();

        expect(spies.generateRequest).toHaveBeenCalledWith("delete", mockData);
      });

      describe('on success', () => {
        beforeEach(() => {
          $httpBackend.expectDELETE(mockRequestURL);
          $scope.removeFromEshelf();
          $httpBackend.flush();
        });

        afterEach(() => {
          $httpBackend.verifyNoOutstandingExpectation();
          $httpBackend.verifyNoOutstandingRequest();
        });

        it('should set $scope.running to false', () => {
          expect($scope.running).toBe(false);
        });

        it('should call nyuEshelfService.success method', () => {
          expect(spies.success).toHaveBeenCalled();
        });

      });

      describe('on failure', () => {

        beforeEach(() => {
          eshelfDestroyHandler.respond(401, '');
          $httpBackend.expectDELETE(mockRequestURL);
          $scope.removeFromEshelf();
          $httpBackend.flush();
        });

        afterEach(() => {
          $httpBackend.verifyNoOutstandingExpectation();
          $httpBackend.verifyNoOutstandingRequest();
        });

        it('should call nyuEshelfService.failure method', () => {
          expect(spies.failure).toHaveBeenCalled();
        });
      });
    });

    describe('eshelfCheckBoxTrigger', () => {
      beforeEach(() => {
        spyOn($scope, 'removeFromEshelf');
        spyOn($scope, 'addToEshelf');
      });

      it('should be defined', () => {
        expect($scope.eshelfCheckBoxTrigger).toBeDefined();
      });

      it('should set $scope.running to true', () => {
        $scope.eshelfCheckBoxTrigger();
        expect($scope.running).toBe(true);
      });

      it('should addToEshelf if not in eshelf', () => {
        $scope.inEshelf = () => false;
        $scope.eshelfCheckBoxTrigger();
        expect($scope.addToEshelf).toHaveBeenCalled();
      });

      it('should removeFromEshelf if not in eshelf', () => {
        $scope.inEshelf = () => true;
        $scope.eshelfCheckBoxTrigger();
        expect($scope.removeFromEshelf).toHaveBeenCalled();
      });
    });
  }); // end $scope functions
});
