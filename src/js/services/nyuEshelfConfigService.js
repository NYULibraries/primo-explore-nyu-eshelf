nyuEshelfConfigService.$inject = ['nyuEshelfConfigDefaults', 'nyuEshelfConfig', '$location']
function nyuEshelfConfigService(defaults, config, $location) {
  // Merge default config values with local configs
  // Note: Be aware that angular.merge is deprecated and will not work in > 2
  let mergedConfig = {};
  angular.merge(mergedConfig, defaults, config);
  // Reassign guestEshelf to toolbar for backwards-compatibility with old implementation
  if (mergedConfig.guestEshelf) {
    console.warn("guestEshelf text for nyuEshelf will be deprecated in a later version. Use configuration value \"toolbar\" instead");
    mergedConfig['toolbar'] = config.guestEshelf;
  }
  // Set primoBaseUrl for pds return script based on current instance
  mergedConfig['primoBaseUrl'] = $location.protocol() + "://" + $location.host() + ":" + $location.port();
  // Setup the environment config based on current host matching config obj
  mergedConfig['envConfig'] = (typeof mergedConfig[$location.host()] === 'undefined') ? mergedConfig.defaultUrls : mergedConfig[$location.host()];
  return mergedConfig;
}

export default nyuEshelfConfigService;
