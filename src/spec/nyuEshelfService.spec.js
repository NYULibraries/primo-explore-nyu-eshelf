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
    let $httpBackend, urlMatch, mockToken, mockData;
    let tokenRequestHandler;
    beforeEach(inject(function(_$httpBackend_){
      $httpBackend = _$httpBackend_;

      mockToken = 'acbd123';
      mockData = [
        { external_id: 'nyu_12345'},
        { external_id: 'nyu_54321'},
        { external_id: 'nyu_abcd123'},
        { external_id: 'nyu_xyz9876'},
      ];
      let url = nyuEshelfConfig.defaultUrls.eshelfBaseUrl + "/records/from/primo.json";
      url = escapeRegExp(url);
      urlMatch = new RegExp(url);

      tokenRequestHandler = $httpBackend
                              .when('GET', urlMatch)
                              .respond(mockData,
                              {'x-csrf-token': mockToken });
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

    it('should assign recordId props the service as true', () => {
      $httpBackend.expectGET(urlMatch);
      nyuEshelfService.initEshelf();
      $httpBackend.flush();

      mockData.forEach(item => {
        expect(nyuEshelfService[item.external_id]).toBe(true);
      });
    });

  }); // end initEshelf

  describe('generateRequest', () => {

    let data, mockToken, url, headers;
    beforeEach(() => {
      const recordId = 'acbd123';
      mockToken = 'xxx12345xxx';
      data = { "record": { "external_system": "primo", "external_id": recordId }};
      url = nyuEshelfConfig.defaultUrls.eshelfBaseUrl + "/records.json";
      headers =  { 'X-CSRF-Token': mockToken, 'Content-type': 'application/json;charset=utf-8' };

      nyuEshelfService.csrfToken = mockToken;
    });

    it('should generate a post request', () => {
      const request = nyuEshelfService.generateRequest('post', data);

      expect(request).toEqual({
        method: "POST",
        url,
        headers,
        data
      });
    });

    it('should generate a delete request', () => {
      const request = nyuEshelfService.generateRequest('delete', data);

      expect(request).toEqual({
        method: "DELETE",
        url,
        headers,
        data
      });
    });

  }); // end generateRequest

  describe('success', () => {

    let mockToken, recordId;
    beforeEach(() => {
      mockToken = 'xxx1234xxx';
      recordId = 'abcd123';
    });

    describe('200 response', () => {
      beforeEach(() => {
        const goodResponse = {
          headers: arg => arg === 'x-csrf-token' ? mockToken : null,
          status: 201
        };

        nyuEshelfService.success(goodResponse, recordId);
      });

      it('should set externalId key to true on service', () => {
        expect(nyuEshelfService[recordId]).toBe(true);
      });

      it('should set csrfToken', () => {
        expect(nyuEshelfService.csrfToken).toEqual(mockToken);
      });
    });


    describe('non-200 response', () => {

      beforeEach(() => {
        nyuEshelfService[recordId] = true; //set to true intially

        const badResponse = {
          headers() {
            return null;
          },
          status: 400
        };

        nyuEshelfService.success(badResponse, recordId);
      });

      it("should ensure externalId key isn't truthy", () => {
        expect(nyuEshelfService[recordId]).toBeFalsy();
      });

    });

  });

  describe('failure', () => {

    it('should set an error key to true', () => {
      const recordId = 'abcd123';
      nyuEshelfService.failure({}, recordId);
      expect(nyuEshelfService[recordId+"_error"]).toBe(true);
    });

  });
});
