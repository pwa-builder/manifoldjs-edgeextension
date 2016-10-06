'use strict';

var fs = require('fs'),
    path = require('path'),
    Q = require('q');

var lib = require('manifoldjs-lib'),
    CustomError = lib.CustomError;

var localize = require('./localize');

var validIconFormats = [
  'png',
  'image/png'
];

function getFormatFromIcon(icon) {
  return icon.type || (icon.src && icon.src.split('.').pop());
}

function isValidIconFormat(icon, validFormats) {
  if (!validFormats || validFormats.length === 0) {
    return true;
  }

  var iconFormat = getFormatFromIcon(icon);

  for (var i = 0; i < validFormats.length; i++) {
    if (validFormats[i].toLowerCase() === iconFormat) {
      return true;
    }
  }

  return false;
}

function capabilitiesString(extManifest) {
  // Map extension permissions to app capabilities
  var capabilitiesMap = {
    '<any url>': 'websiteContent',
    '<all_urls>': 'websiteContent',
    'cookies': 'websiteCookies',
    'geolocation': 'geolocation',
    'storage': 'browserStorage',
    'tabs': 'websiteInfo',
    'webNavigation': 'websiteInfo',
    'webRequest': 'browserWebRequest'
  };

  var capabilities = {};
  for (var index = 0; index < extManifest.permissions.length; index++) {
    var element = extManifest.permissions[index];

    if (capabilitiesMap.hasOwnProperty(element)) {
      capabilities[capabilitiesMap[element]] = true;
    }

    if (element.indexOf('://') > 0) {
      capabilities['websiteContent'] = true;
    }
  }

  var capCount = Object.keys(capabilities).length;
  var capString = '';
  for (var key in capabilities) {
    if (capabilities.hasOwnProperty(key)) {
      capString += '<Capability Name="' + key + '"/>';
      if (capCount > 1) {
        capString += '\r\n\t\t\t\t\t\t\t\t';
      }
      capCount--;
    }
  }

  return capString;
}

function getExtensionVersion(extManifest) {
  // Take the version from the extension and pad with 0's on the left if it does not have 4 segments
  var versionParts = extManifest.version.split('.');

  while (versionParts.length < 4) {
    versionParts.unshift('0');
  }

  var versionString = versionParts.slice(0, 4).join('.');
  return versionString;
}

function replaceManifestValues(extManifest, content, extensionLocalesList) {
  content = localize.localizeAppxManifest(extManifest, content, extensionLocalesList);

  // Update general properties
  var capabilities = capabilitiesString(extManifest);
  var version = getExtensionVersion(extManifest);

  var replacedContent = content
    .replace(/{DisplayName}/g, extManifest.name)
    .replace(/{Version}/g, version)
    .replace(/{Description}/g, extManifest.description)
    .replace(/{Capabilities}/g, capabilities);

  return replacedContent;
}

function convertFromBase(manifestInfo, extensionLocalesList, callback) {
  if (!manifestInfo || !manifestInfo.content) {
    return Q.reject(new Error('Manifest content is empty or not initialized.')).nodeify(callback);
  }

  var originalManifest = manifestInfo.content;

  var manifestTemplatePath = path.join(__dirname, 'assets', 'appxmanifest-template.xml');

  return Q.nfcall(fs.readFile, manifestTemplatePath).then(function (data) {
    var timestamp = manifestInfo.timestamp || new Date().toISOString().replace(/T/, ' ').replace(/\.[0-9]+/, ' ');

    var rawManifest = data.toString();
    rawManifest = replaceManifestValues(originalManifest, rawManifest, extensionLocalesList);

    var icons = {};
    if (originalManifest.icons && originalManifest.icons.length) {
      for (var i = 0; i < originalManifest.icons.length; i++) {
        var icon = originalManifest.icons[i];

        if (isValidIconFormat(icon, validIconFormats)) {
          var iconDimensions = icon.sizes.split('x');
          if (iconDimensions[0] === '44' && iconDimensions[1] === '44') {
            icons['44x44'] = { 'url': icon.src, 'fileName': 'smalllogo.scale-100.png' };
          } else if (iconDimensions[0] === '50' && iconDimensions[1] === '50') {
            icons['50x50'] = { 'url': icon.src, 'fileName': 'storelogo.scale-100.png' };
          } else if (iconDimensions[0] === '150' && iconDimensions[1] === '150') {
            icons['150x150'] = { 'url': icon.src, 'fileName': 'logo.scale-100.png' };
          } else if (iconDimensions[0] === '620' && iconDimensions[1] === '300') {
            icons['620x300'] = { 'url': icon.src, 'fileName': 'splashscreen.scale-100.png' };
          }
        }
      }
    }

    var manifest = {
      'rawData': rawManifest,
      'icons': icons,
    };

    var convertedManifestInfo = {
      'content': manifest,
      'format': lib.constants.WINDOWS10_MANIFEST_FORMAT,
      'timestamp': timestamp
    };

    if (manifestInfo.generatedUrl) {
      convertedManifestInfo.generatedUrl = manifestInfo.generatedUrl;
    }

    if (manifestInfo.generatedFrom) {
      convertedManifestInfo.generatedFrom = manifestInfo.generatedFrom;
    }

    return convertedManifestInfo;
  })
  .catch(function (err) {
    return Q.reject(new CustomError('Could not read the manifest template', err));
  })
  .nodeify(callback);
}

module.exports = {
  convertFromBase: convertFromBase,
  replaceManifestValues: replaceManifestValues
};