const nyuEshelfConfig = __fixtures__['nyuEshelfConfig'];

describe('nyuEshelfConfigService', () => {

  describe('with no custom configuration', () => {
    beforeEach(module('nyuEshelf', $provide => {
      $provide.constant('nyuEshelfConfig', {});
    }));

    let nyuEshelfConfigService;
    beforeEach(inject(function(_nyuEshelfConfigService_) {
      nyuEshelfConfigService = _nyuEshelfConfigService_;
    }));

    it('should contain default properties', () => {
      const { myEshelfButtonClasses, myEshelf, guestEshelf, addToEshelf, inEshelf, inGuestEshelf, loginToSave, adding, deleting, error } = nyuEshelfConfig;
      const defaults = { myEshelfButtonClasses, myEshelf, guestEshelf, addToEshelf, inEshelf, inGuestEshelf, loginToSave, adding, deleting, error };
      for (const key in defaults) {
        expect(nyuEshelfConfigService[key]).toEqual(defaults[key]);
      }
    });

    it('should merge defaultUrls', () => {
      const defaultUrls = {
        pdsUrl: {
          base: 'https://pdsdev.library.nyu.edu/pds',
          callingSystem: 'primo'
        },
        eshelfBaseUrl: 'https://qa.eshelf.library.nyu.edu',
        institution: 'NYU'
      };

      expect(nyuEshelfConfigService.envConfig).toEqual(defaultUrls);
    });


    it('should construct primoBaseUrl', () => {
      const primoBaseUrl = "http://server:80";
      expect(nyuEshelfConfigService.primoBaseUrl).toEqual(primoBaseUrl);
    });

  });

  describe('when utilizing on host', () => {

    beforeEach(module('nyuEshelf', $provide => {
      $provide.service('$location', () => {
        return {
          protocol: () => "http",
          host: () => "bobcat.library.nyu.edu",
          port: () => "80"
        };
      });
      $provide.constant('nyuEshelfConfig', {});
    }));

    let nyuEshelfConfigService;
    beforeEach(inject(function(_nyuEshelfConfigService_) {
      nyuEshelfConfigService = _nyuEshelfConfigService_;
    }));

    it('should use specified URLs', () => {

      const defaultHost = {
        pdsUrl: {
          base: 'https://pds.library.nyu.edu/pds',
          callingSystem: 'primo'
        },
        eshelfBaseUrl: 'https://eshelf.library.nyu.edu',
        institution: 'NYU'
      };

      expect(nyuEshelfConfigService.envConfig).toEqual(defaultHost);
    });
  });

  describe('with custom configuration', () => {
    // TODO: figure out why doesn't consistently pass
    let customConfig;
    beforeEach(module('nyuEshelf', $provide => {
      const customMessages = {
        myEshelf: 'My custom e-shelf',
        adding: 'Adding to custom e-shelf...',
        error: 'My custom error'
      };

      customConfig = angular.copy(nyuEshelfConfig);
      customConfig = { customConfig, ...customMessages };
      delete customConfig["bobcat.library.nyu.edu"];
      $provide.constant('nyuEshelfConfig', customConfig);
    }));

    let nyuEshelfConfigService;
    beforeEach(inject(function(_nyuEshelfConfigService_) {
      nyuEshelfConfigService = _nyuEshelfConfigService_;
    }));

    it('should merge custom properties into config', () => {
      for (const key in customConfig) {
        expect(customConfig[key]).toEqual(nyuEshelfConfigService[key]);
      }
    });

  }); // end custom configuration

});
