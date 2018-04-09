describe('nyuEshelf.config', () => {

  beforeEach(module('nyuEshelf'));

  let $http;
  beforeEach(inject((_$http_) => {
    $http = _$http_;
  }));

  it('should enable useXDomain', () => {
    expect($http.defaults.useXDomain).toBe(true);
  });

  it('should enable withCredentials', () => {
    expect($http.defaults.withCredentials).toBe(true);
  });

  it('should remove the X-Requested-With header', () => {
    expect($http.defaults.headers.common['X-Requested-With']).not.toBeDefined();
  });

});
