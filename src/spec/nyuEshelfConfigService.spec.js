const nyuEshelfConfig = __fixtures__['nyuEshelfConfig'];

describe('nyuEshelfConfigService', () => {

  // let nyuEshelfConfigService, $location;
  // beforeEach(inject(function(_$location_, $injector) {
  //   debugger;
  //   // nyuEshelfConfigService = _nyuEshelfConfigService_;
  //   $location = {
  //     protocol: () => "http",
  //     host: () => "example.com",
  //     port: () => "8080"
  //   };
  // }));

  it('should contain default properties', () => {
    // const { myEshelfButtonClasses, myEshelf, guestEshelf, addToEshelf, inEshelf, inGuestEshelf, loginToSave, adding, deleting, error } = nyuEshelfConfig;
    // const defaults = { myEshelfButtonClasses, myEshelf, guestEshelf, addToEshelf, inEshelf, inGuestEshelf, loginToSave, adding, deleting, error };
    // for (const key/ in defaults) {
    //   expect(nyuEshelfConfigService[key]).toEqual(defaults[key]);
    // }
  });

  // it('should merge defaultUrls when host settings not found', () => {
  //   expect(nyuEshelfConfigService.envConfig).toEqual(nyuEshelfConfig.defaultUrls);
  // });
  //
  // it('should use specified URLs when host settings found', () => {
  //   const host = "bobcat.library.nyu.edu";
  //   $location = {
  //     protocol: () => "http",
  //     host: () => host,
  //     port: () => "8080"
  //   };
  //
  //   expect(nyuEshelfConfigService.envConfig).toEqual(nyuEshelfConfig[host]);
  // });
  //
  // it('should construct primoBaseUrl', () => {
  //   const primoBaseUrl = "http://example.com:8080";
  //   expect(nyuEshelfConfigService.primoBaseUrl).toEqual(primoBaseUrl);
  // });

  // describe('with custom configuration', () => {
  //   let customConfig;
  //   const customMessages = {
  //     myEshelf: 'My custom e-shelf',
  //     adding: 'Adding to custom e-shelf...',
  //     error: 'My custom error'
  //   };
  //
  //   beforeEach(module('nyuEshelf', ($provide) => {
  //     customConfig = angular.copy(nyuEshelfConfig);
  //     Object.assign(customConfig, customMessages);
  //     delete customConfig["bobcat.library.nyu.edu"];
  //     $provide.constant('nyuEshelfConfig', customConfig);
  //   }));
  //
  //   it('should merge custom properties into config', () => {
  //     for (const key in customConfig) {
  //       expect(customConfig[key]).toEqual(nyuEshelfConfigService[key]);
  //     }
  //   });
  //
  // });

});
