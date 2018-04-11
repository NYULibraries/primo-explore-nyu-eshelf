export default function(config, $http) {
  return {
    initialized: false, // Is the csrfToken initialized on first load of the page?
    csrfToken: '', // Storage spot for the csrfToken
    loggedIn: false, // Are we logged in?,
    // Make an initial call to eshelf to find out if any of the current
    // records are already in our eshelf and geet the first csrfToken
    initEshelf() {
      let svc = this; // For maintaining service scoping in the function below
      // Eshelf API to setup csrfToken and avoid that pesky cache
      let url = config.envConfig.eshelfBaseUrl + "/records/from/primo.json?per=all&_=" + Date.now();
      // Get the csrfToken already
      $http.get(url).then(
        (response) => {
          if (response.headers('x-csrf-token')) {
            svc.csrfToken = response.headers('x-csrf-token');
            svc.initialized = true;
          }
        },
        (response) => {
          console.error("Error in e-Shelf CORS API");
          console.error("Response: " + response);
        }
      );
    },
    // Check eshelf for existing externalId
    checkEshelf(externalId) {
      // Use eshelf API to check if record with externalId is in current user's eshelf
      let url = config.envConfig.eshelfBaseUrl + "/records/from/primo.json?per=all&external_id[]=" + externalId;
      let svc = this; // For maintaining service scoping in the function below
      $http.get(url).then(
          (response) => {
            if (response.data.length > 0) {
              if (response.data.filter(item => item["external_id"] == externalId)) {
                // If we found the externalId in the response set that
                // id on the service object to true so we can reference it later
                svc[externalId] = true;
              }
            }
          },
          // Oops, set an error object
          (response) => {
            svc[externalId+'_error'] = true;
            console.error(response.data);
          }
       );
    },
    // Generate a generic http request for the different types of calls to eshelf
    generateRequest(method, data) {
      method = method.toUpperCase();
      // Whitelist http methods DELETE and POST
      if (!/^(DELETE|POST)$/.test(method)) {
        return {};
      }
      // Cors headers
      const headers = { 'X-CSRF-Token': this.csrfToken, 'Content-type': 'application/json;charset=utf-8' };
      const url = config.envConfig.eshelfBaseUrl + "/records.json";

      return ({ method, url, headers, data });
    },
    failure(_response, externalId) {
      this[externalId+'_error'] = true;
    },
    // Set the new csrfToken to the response header on success
    success(response, externalId) {
      if (response.headers('x-csrf-token')) {
        this.csrfToken = response.headers('x-csrf-token');
      }

      if (response.status == 201) {
        this[externalId] = true;
        delete this[externalId+'_error'];
      } else {
        delete this[externalId];
      }
    }
  };
}
