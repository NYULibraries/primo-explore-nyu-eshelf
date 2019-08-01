import nyuEshelfConfigDefaults from './fixtures/nyuEshelfConfig';
import nyuEshelfDeprecatedConfig from './fixtures/nyuEshelfDeprecatedConfig';

describe('nyuEshelfConfigService', () => {
  beforeEach(() => {
    spyOn(console, "warn");
  });

  describe('with no custom configuration', () => {
    beforeEach(module('nyuEshelf', $provide => {
      $provide.constant('nyuEshelfConfigDefaults', nyuEshelfConfigDefaults);
      $provide.constant('nyuEshelfConfig', {});
    }));

    let nyuEshelfConfigService;
    beforeEach(inject((_nyuEshelfConfigService_) => {
      nyuEshelfConfigService = _nyuEshelfConfigService_;
    }));

    it('should contain default properties', () => {
      const { myEshelfButtonClasses, toolbar, addToEshelf, inEshelf, inGuestEshelf, loginToSave, adding, deleting, error } = nyuEshelfConfigDefaults;
      const defaults = { myEshelfButtonClasses, toolbar, addToEshelf, inEshelf, inGuestEshelf, loginToSave, adding, deleting, error };

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


    it('should construct primoBaseUrl from host & port', () => {
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
      $provide.constant('nyuEshelfConfigDefaults', nyuEshelfConfigDefaults);
      $provide.constant('nyuEshelfConfig', {});
    }));

    let nyuEshelfConfigService;
    beforeEach(inject((_nyuEshelfConfigService_) => {
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
    let customConfig;
    beforeEach(() => {
      const customValues = {
        adding: 'Adding to custom e-shelf...',
        error: 'My custom error',
      };

      customConfig = Object.assign({}, nyuEshelfConfigDefaults);
      Object.assign(customConfig, customValues);

      // delete deeply nested values
      delete customConfig["bobcat.library.nyu.edu"];
    });

    beforeEach(module('nyuEshelf', $provide => {
      $provide.constant('nyuEshelfConfigDefaults', customConfig);
      $provide.constant('nyuEshelfConfig', customConfig);
    }));

    let nyuEshelfConfigService;
    beforeEach(inject((_nyuEshelfConfigService_) => {
      nyuEshelfConfigService = _nyuEshelfConfigService_;
    }));

    it('should merge custom properties into config', () => {
      for (const key in customConfig) {
        expect(customConfig[key]).toEqual(nyuEshelfConfigService[key]);
      }
    });

  }); // end custom configuration

  describe("with deprecated 'guestEshelf' implementation", () => {
    beforeEach(module('nyuEshelf', $provide => {
      $provide.constant('nyuEshelfConfigDefaults', nyuEshelfConfigDefaults);
      $provide.constant('nyuEshelfConfig', nyuEshelfDeprecatedConfig);
    }));

    let nyuEshelfConfigService;
    beforeEach(inject((_nyuEshelfConfigService_) => {
      nyuEshelfConfigService = _nyuEshelfConfigService_;
    }));

    it('should assign guestEshelf value to toolbar', () => {
      expect(nyuEshelfConfigService.toolbar).toEqual(nyuEshelfDeprecatedConfig.guestEshelf);
    });

    it('should include a deprecation warning', () => {
      expect(console.warn).toHaveBeenCalled();
    });
  });

});
