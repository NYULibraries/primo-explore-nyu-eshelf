// source: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const nyuEshelfConfig = __fixtures__['nyuEshelfConfig'];

describe('nyuEshelfService', () => {

  beforeEach(module('nyuEshelf', $provide => {
    $provide.service('nyuEshelfConfigService', () => {
      const config = angular.copy(nyuEshelfConfig);
      config.primoBaseUrl = "http://www.example.com:8080";
      config.envConfig = config.defaultUrls;
      return config;
    });
  }));

  let nyuEshelfService;
  beforeEach(inject(function(_nyuEshelfService_) {
    nyuEshelfService = _nyuEshelfService_;
  }));

  describe('before initalize', () => {
    it('should have intialized set to false', () => {
      expect(nyuEshelfService.initialized).toBe(false);
    });

    it('should set csrfToken to empty string', () => {
      expect(nyuEshelfService.csrfToken).toEqual('');
    });

    it('should set loggedIn to false', () => {
      expect(nyuEshelfService.loggedIn).toBe(false);
    });
  });

  describe('initEshelf', () => {
    let $httpBackend, urlMatch, mockToken;
    let tokenRequestHandler;
    beforeEach(inject(function(_$httpBackend_){
      $httpBackend = _$httpBackend_;

      mockToken = 'acbd123';

      let url = nyuEshelfConfig.defaultUrls.eshelfBaseUrl + "/records/from/primo.json";
      url = escapeRegExp(url);
      urlMatch = new RegExp(url);

      tokenRequestHandler = $httpBackend
                              .when('GET', urlMatch)
                              .respond({data: 'mockData'}, {'x-csrf-token': mockToken });
    }));

    beforeEach(() => {
      spyOn(console, "error");
    });

    afterEach(() => {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should fetch x-csrf-token', () => {
      $httpBackend.expectGET(urlMatch);
      nyuEshelfService.initEshelf();
      $httpBackend.flush();
    });

    it('should assign csrfToken to the service', () => {
      $httpBackend.expectGET(urlMatch);
      nyuEshelfService.initEshelf();
      $httpBackend.flush();

      expect(nyuEshelfService.csrfToken).toEqual(mockToken);
    });

    it('should log console errors on failure', () => {
      tokenRequestHandler.respond(401, '');

      $httpBackend.expectGET(urlMatch);
      nyuEshelfService.initEshelf();
      $httpBackend.flush();

      expect(console.error).toHaveBeenCalled();
      expect(nyuEshelfService.csrfToken).toEqual('');
    });


    });

    describe('checkEshelf', () => {

      let $httpBackend;
      let eshelfRequestHandler;
      let mockData, mockTargetRecord, url;
      beforeEach(inject(function(_$httpBackend_){
        $httpBackend = _$httpBackend_;

        mockTargetRecord = 'acbd123';
        mockData = ['x1', mockTargetRecord, 'x2', 'x3'];

        url = nyuEshelfConfig.envConfig.eshelfBaseUrl + "/records/from/primo.json?per=all&external_id[]=" + mockTargetRecord;
        url = escapeRegExp(url);

        eshelfRequestHandler = $httpBackend
                                  .when('GET', url)
                                  .respond(mockData);
      }));

      it('should add externalId key, set to true, if item found on server', () => {
        
      });

  });

  // describe('initEshelf', () => {
  //
  //   let $httpBackend, $http, url;
  //   beforeEach(inject(function(_$httpBackend_, _$http_){
  //     $httpBackend = _$httpBackend_;
  //     $http = _$http_;
  //
  //     url = nyuEshelfConfig.defaultUrls.eshelfBaseUrl +
  //       "/records/from/primo.json?per=all&_=" +
  //       Date.now();
  //
  //     $httpBackend.when('GET', url).respond(200, { 'x-csrf-token': 'xxx' });
  //   }));
  //
  //   afterEach(() => {
  //     $httpBackend.verifyNoOutstandingExpectation();
  //     $httpBackend.verifyNoOutstandingRequest();
  //   });
  //
  //   it('should...', () => {
  //     nyuEshelfService.initEshelf();
  //     $httpBackend.expectGET(url);
  //     $httpBackend.flush();
  //   });
  //
  // });


});
