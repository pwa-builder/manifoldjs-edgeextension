'use strict';

var fs = require('fs'),
    path = require('path'),
    util = require('util');
    
var Q = require('q');

var lib = require('manifoldjs-lib');

var CustomError = lib.CustomError,
    fileTools = lib.fileTools,
    PlatformBase = lib.PlatformBase;

var constants = require('./constants'),
    manifest = require('./manifest'),
    appPackage = require('./appPackage'),
    localize = require('./localize');
   
function Platform (packageName, platforms) {

  var self = this;

  PlatformBase.call(this, constants.platform.id, constants.platform.name, packageName, __dirname);

  // save platform list
  self.platforms = platforms;

  // override create function
  self.create = function (extManifestInfo, rootDir, options, callback) {
    if (extManifestInfo.format !== lib.constants.EDGE_EXTENSION_MANIFEST_FORMAT) {
      return Q.reject(new CustomError('The \'' + extManifestInfo.format + '\' manifest format is not valid for this platform.'));
    }

    self.info('Generating the ' + constants.platform.name + ' app...');
    
    var assetsDir = path.join(self.baseDir, 'assets');
    var platformDir = path.join(rootDir, constants.platform.id);
    var manifestDir = path.join(platformDir, 'manifest');
    var imagesDir = path.join(manifestDir, 'Assets');
    var extensionDir = path.join(manifestDir, 'Extension');
    var resourcesDir = path.join(manifestDir, 'Resources');
    var sourceDir = path.join(platformDir, 'source');
    var originalExtensionDir = "";
    
    for (var index = 0; index < process.argv.length; index++) {
      var element = process.argv[index];
      if (element == "-m" && process.argv.length > index + 1) {
        originalExtensionDir = process.argv[index + 1]
            .split("/").join("\\")
            .replace("\\manifest.json", "");
        break;
      }
    }
    var extensionLocalesList = [];
    var extensionLocalesDir = path.join(originalExtensionDir, "_locales")
    try {
      extensionLocalesList = fs.readdirSync(extensionLocalesDir);
    }
    catch(ex) {}
    var shouldLocalize = false;

    // convert the W3C manifest to a platform-specific manifest
    var platformManifestInfo;

    self.debug('Converting the ' + constants.platform.name + ' manifest.json to an appxmanifest.xml...');
    return manifest.convertFromBase(extManifestInfo, extensionLocalesList)
      // Save the converted manifest
      .then(function (manifestInfo) {
        platformManifestInfo = manifestInfo;
      })
      // Clobber the platform Directory
      .then(function() {
        self.debug('Deleting the ' + constants.platform.name + ' app folder if it exists...');
        var deleteFolderRecursive = function(pathToDelete) {
          if(fs.existsSync(pathToDelete)) {
            fs.readdirSync(pathToDelete).forEach(function(file,index){
              var curPath = path.join(pathToDelete, file);
              if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
              } else { // delete file
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(pathToDelete);
          }
        }

        deleteFolderRecursive(platformDir);
      })
      // if the platform dir doesn't exist, create it
      .then(function () {      
        self.debug('Creating the ' + constants.platform.name + ' app folder...');
        return fileTools.mkdirp(platformDir);
      })
      // persist the platform-specific manifest
      .then(function () {
        return fileTools.mkdirp(manifestDir).then(function () {
          self.debug('Copying the ' + constants.platform.name + ' manifest to the app folder...');
          var manifestFilePath = path.join(manifestDir, 'appxmanifest.xml');
          return Q.nfcall(fs.writeFile, manifestFilePath, platformManifestInfo.content.rawData)
                  .catch(function (err) {
                    return Q.reject(new CustomError('Failed to copy the manifest to the platform folder.', err));
                  });
        });
      })
      // if the extension folder does not exist, create it
      .then(function () {       
        self.debug('Creating the ' + constants.platform.name + ' Extension folder...');
        return fileTools.mkdirp(extensionDir);
      })
      // copy the original extension files to the project
      .then(function () {
        self.info('Copying extension files to the ' + constants.platform.name + ' Extension folder...');
        return fileTools.copyFolder(originalExtensionDir, extensionDir, { clobber: true });
      }) 
      // download icons to the app's folder
      .then(function () {
        return self.downloadIcons(platformManifestInfo.content, extManifestInfo.content.start_url, imagesDir);
      })
      // Test for Localization
      .then(function() {
        self.info('Testing to see if localization is needed...');
        shouldLocalize = localize.shouldLocalize(extManifestInfo.content);
        if (extensionLocalesList.count > 0 && !shouldLocalize) {
          self.warn('Localized resources exist but no we cannot localize this extension for Windows. In the manifest.json ensure default_locale is set and that either the name or description fields are pointing to localized resouces!');
        }
      })
      // Create Localized Resources folder
      .then(function () {
        if (shouldLocalize) {
          self.debug('Creating the ' + constants.platform.name + ' Resources folder...');
          return fileTools.mkdirp(resourcesDir);
        }
      })
      // Create Localized resource.resjson files
      .then(function () {
        if (shouldLocalize) {
          self.info('Creating the localized resource.resjson files...');
          localize.createResJsonFiles(extManifestInfo.content, extensionLocalesList, extensionLocalesDir, resourcesDir);
        }
      })
      // Create PriConfig file
      .then(function () {
        if (shouldLocalize) {
          self.info('Creating the localization priconfig.xml file...');

          localize.copyPriConfigTemplate(path.join(manifestDir, "priconfig.xml"), extManifestInfo.content);

          //localize.makePriConfig(path.join(manifestDir, "priconfig.xml"), extManifestInfo.content);
        }
      })
      // write generation info (telemetry)
      .then(function () {
        return self.writeGenerationInfo(extManifestInfo, platformDir);
      })
      // Remind user to update the appxmanifest.xml
      .then(function () {
        self.info('Edit the appxmanifest.xml file before packaging!!!');
      })
      .nodeify(callback);
  };

  // override package function
  self.package = function (projectDir, options, callback) {
      
    if (options.Sign) {
      self.info('The ' + constants.platform.name + ' app received a Sign flag and will be signed by CloudAppx!');
    }
    
    //set the flag to call the sign end endpoint or just go with regular one
    var shouldSign = false;
    if (options.Sign) {
      shouldSign = true;
    }
    
    var platformDir = path.join(projectDir || process.cwd(), constants.platform.id);
    var directory = path.join(platformDir, 'manifest');
    
    self.info('Packaging the ' + constants.platform.name + ' app...');
    var outputPath = path.join(platformDir, 'package');
    var packagePath = path.join(outputPath, 'edgeExtension.appx');

    return fileTools.mkdirp(outputPath)
    .then(function() {
      var priconfigFile = path.join(platformDir, "manifest", "priconfig.xml");
      if(fs.existsSync(priconfigFile))
        return localize.makePriFiles(path.join(platformDir, "manifest"));
    })
    .then(function () {
      // creates App Store package for publishing
      return appPackage.makeAppx(directory, packagePath, shouldSign);
    })
    .nodeify(callback);
  };
}

util.inherits(Platform, PlatformBase);

module.exports = Platform;
