# primo-explore-nyu-eshelf

## Description

Add custom NYU E-Shelf functionality.

### Screenshot

#### Example 1: In brief results
![screenshot](screenshot1.png)

#### Example 2: In full display
![screenshot](screenshot2.png)

#### Example 3: In toolbar
![screenshot](screenshot3.png)

## Installation

1. Assuming you've installed and are using [primo-explore-devenv](https://github.com/ExLibrisGroup/primo-explore-devenv).

2. Navigate to your template/central package root directory. For example:
    ```
    cd primo-explore/custom/MY_VIEW_ID
    ```
3. If you do not already have a package.json file in this directory, create one:
    ```
    npm init -y
    ```
4. Install this package:
    ```
    npm install primo-explore-nyu-eshelf --save-dev
    ```

## Usage

Once installed, inject `nyuEshelf` as a dependency:

```js
let app = angular.module('viewCustom', ['nyuEshelf'])
```

**Note:** If you're using the --browserify build option, you will need to first import the module with:

```js
import 'primo-explore-nyu-eshelf';
```

### In brief and full results

To enable the checkbox after the availability line configure the following component:

```js
app
  .component('prmSearchResultAvailabilityLineAfter', {
    template: '<nyu-eshelf></nyu-eshelf>'
  })
```

### In toolbar

To add a link to your external e-Shelf in the toolbar configure the following component:

```js
app
  .component('prmSearchBookmarkFilterAfter', {
    template: '<nyu-eshelf-toolbar></nyu-eshelf-toolbar>'
  })
```

### Run block

In order to initialize eShelf, a run block must also be added to the run block on the main app:

```js
app.run(runBlock);

runBlock.$inject = ['nyuEshelfService'];

function runBlock(nyuEshelfService) {
  // other potential run operations...
  nyuEshelfService.initEshelf();
}
```

### Disable out of the box "Saved Records" functionality

If you want to fully hide the existing "Saved Records" functionality and exclusively use the custom e-Shelf add the following CSS:

```css
// Disable built in e-shelf
.pin-button,
prm-favorites-labels,
prm-search-bookmark-filter a[aria-label='Go to my favorites'],
prm-search-bookmark-filter a[aria-label="nui.favorites.goFavorites.tooltip"],
prm-favorites md-tab-item:first-child {
  display: none !important;
}
```

### Stylize header button to look like existing buttons

```css
prm-search-bookmark-filter-after button.search-bookmark-filter-item {
  border-radius: 20px !important;
  min-width: 40px !important;
}
prm-search-bookmark-filter-after button.search-bookmark-filter-item:hover {
  box-shadow: 0 1px 0 #888888;
}
```

### Config

You'll need to configure the module by passing it an object as an angular `constant` called `nyuEshelf`:

| name | type | usage |
|------|-------------|--------|
| `myEshelfButtonClasses` | string | css classes for the 'my e-shelf' button in the toolbar |
| `myEshelf` | string | text for toolbar link when user is signed in |
| `guestEshelf` | string | text for toolbar link when user is signed out |
| `addToEshelf` | string | text for checkbox label when record is not in e-shelf |
| `inEshelf` | string | text for checkbox label when record is in e-shelf and user is signed in |
| `inGuestEshelf` | string | text for checkbox label when record is in e-shelf and user is signed out |
| `loginToSave` | string | text prompting user to sign in to save temporary records |
| `adding` | string | text for checkbox label when adding to e-shelf |
| `deleting` | string | text for checkbox label when removing from e-shelf |
| `error` | string | text for checkbox label when there is an error |

#### URL config

This module needs to build the PDS login URL as well as point to the correct E-Shelf application based on environment. The properties that need to be configured within either `defaultUrls` or an environment-specific `{hostname}` property are:

| name | type | usage |
|------|-------------|--------|
| `pdsUrl` | object | to how to build the login PDS url with three values: `base`, `callingSystem`, `institution` |
| `eshelfBaseUrl` | string | base url for the external e-shelf |

Assuming a dev (default), QA and production environment you would set these values as such:

```javascript
{
  ...
  defaultUrls: {
    pdsUrl: {
      base: 'https://dev-pds.host.edu/pds',
      callingSystem: 'primo'
    },
    eshelfBaseUrl: 'https://dev-eshelf.host.edu',
    institution: 'PRIMO'
  },
  "qa-primo.host.edu": {
    pdsUrl: {
      base: 'https://qa-pds.host.edu/pds',
      callingSystem: 'primo'
    },
    eshelfBaseUrl: 'https://qa-eshelf.host.edu',
    institution: 'PRIMO'
  },
  "production-primo.host.edu": {
    pdsUrl: {
      base: 'https://production-pds.host.edu/pds',
      callingSystem: 'primo'
    },
    eshelfBaseUrl: 'https://production-eshelf.host.nyu',
    institution: 'PRIMO'
  }
}
```

To test locally you could also setup a `"localhost"` property that would work similarly.

**Note**: You may ask why didn't we just use Back Office values to populate based on environment. That would be ideal. The answer is that we don't have access to those translations until rending the component, but we need to have access to the correct E-Shelf URL before then in order to initialize the user session and the user's existing records.

### Example

The below are the defaults, they should be updated for production:

```js
app.constant('nyuEshelf', {
  myEshelfButtonClasses: 'button-over-dark',
  myEshelf: 'My e-Shelf',
  guestEshelf: 'Guest e-Shelf',
  addToEshelf: "Add to e-Shelf",
  inEshelf: "In e-Shelf",
  inGuestEshelf: "In guest e-Shelf",
  loginToSave: "login to save permanently",
  adding: "Adding to e-Shelf...",
  deleting: "Removing from e-Shelf...",
  error: "Could not connect to e-Shelf",
  defaultUrls: {
    pdsUrl: {
      base: 'https://dev-pds.host.edu/pds',
      callingSystem: 'primo',
      institution: 'PRIMO'
    },
    eshelfBaseUrl: 'https://dev-eshelf.host.edu'
  },
  "production-primo.host.edu": {
    pdsUrl: {
      base: 'https://production-pds.host.edu/pds',
      callingSystem: 'primo',
      institution: 'PRIMO'
    },
    eshelfBaseUrl: 'https://production-eshelf.host.nyu'
  }
});
```
