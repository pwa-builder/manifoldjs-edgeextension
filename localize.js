'use strict';

var fs = require('fs'),
    Q = require('q'),    
    url = require('url'),
    exec = require('child_process').exec,
    os = require('os'),
    path = require('path'),
    execute = Q.nfbind(exec),    
    fsStat = Q.nfbind(fs.stat);

var lib = require('manifoldjs-lib'),
    CustomError = lib.CustomError,
    packageTools = lib.packageTools,
    utils = lib.utils,
    log = lib.log;

var constants = require('./constants'),
    MsgKey = "__MSG_";

var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

var acceptedLanguageCodes = ["ar", "ar-sa", "ar-ae", "ar-bh", "ar-dz", "ar-eg", "ar-iq", "ar-jo", "ar-kw", "ar-lb", "ar-ly", "ar-ma", "ar-om", "ar-qa", "ar-sy", "ar-tn", "ar-ye", "af", "af-za", "sq", "sq-al", "am", "am-et", "hy", "hy-am", "as", "as-in", "az", "az-arab", "az-arab-az", "az-cyrl", "az-cyrl-az", "az-latn", "az-latn-az", "eu", "eu-es", "be", "be-by", "bn", "bn-bd", "bn-in", "bs", "bs-cyrl", "bs-cyrl-ba", "bs-latn", "bs-latn-ba", "bg", "bg-bg", "ca", "ca-es", "ca-es-valencia", "chr-cher", "chr-cher-us", "chr-latn", "zh", "zh-Hans", "zh-cn", "zh-hans-cn", "zh-sg", "zh-hans-sg", "zh-Hant", "zh-hk", "zh-mo", "zh-tw", "zh-hant-hk", "zh-hant-mo", "zh-hant-tw", "hr", "hr-hr", "hr-ba", "cs", "cs-cz", "da", "da-dk", "prs", "prs-af", "prs-arab", "nl", "nl-nl", "nl-be", "en", "en-au", "en-ca", "en-gb", "en-ie", "en-in", "en-nz", "en-sg", "en-us", "en-za", "en-bz", "en-hk", "en-id", "en-jm", "en-kz", "en-mt", "en-my", "en-ph", "en-pk", "en-tt", "en-vn", "en-zw", "en-053", "en-021", "en-029", "en-011", "en-018", "en-014", "et", "et-ee", "fil", "fil-latn", "fil-ph", "fi", "fi-fi", "fr", "fr-be", "fr-ca", "fr-ch", "fr-fr", "fr-lu", "fr-015", "fr-cd", "fr-ci", "fr-cm", "fr-ht", "fr-ma", "fr-mc", "fr-ml", "fr-re", "frc-latn", "frp-latn", "fr-155", "fr-029", "fr-021", "fr-011", "gl", "gl-es", "ka", "ka-ge", "de", "de-at", "de-ch", "de-de", "de-lu", "de-li", "el", "el-gr", "gu", "gu-in", "ha", "ha-latn", "ha-latn-ng", "he", "he-il", "hi", "hi-in", "hu", "hu-hu", "is", "is-is", "ig-latn", "ig-ng", "id", "id-id", "iu-cans", "iu-latn", "iu-latn-ca", "ga", "ga-ie", "xh", "xh-za", "zu", "zu-za", "it", "it-it", "it-ch", "ja", "ja-jp", "kn", "kn-in", "kk", "kk-kz", "km", "km-kh", "quc-latn", "qut-gt", "qut-latn", "rw", "rw-rw", "sw", "sw-ke", "kok", "kok-in", "ko", "ko-kr", "ku-arab", "ku-arab-iq", "ky-kg", "ky-cyrl", "lo", "lo-la", "lv", "lv-lv", "lt", "lt-lt", "lb", "lb-lu", "mk", "mk-mk", "ms", "ms-bn", "ms-my", "ml", "ml-in", "mt", "mt-mt", "mi", "mi-latn", "mi-nz", "mr", "mr-in", "mn-cyrl", "mn-mong", "mn-mn", "mn-phag", "ne", "ne-np", "nb", "nb-no", "nn", "nn-no", "no", "no-no,", "or", "or-in", "fa", "fa-ir", "pl", "pl-pl", "pt-br", "pt", "pt-pt", "pa", "pa-arab", "pa-arab-pk", "pa-deva", "pa-in", "quz", "quz-bo", "quz-ec", "quz-pe", "ro", "ro-ro", "ru", "ru-ru", "gd-gb", "gd-latn", "sr-Latn", "sr-latn-cs", "sr", "sr-latn-ba", "sr-latn-me", "sr-latn-rs", "sr-cyrl", "sr-cyrl-ba", "sr-cyrl-cs", "sr-cyrl-me", "sr-cyrl-rs", "nso", "nso-za", "tn", "tn-bw", "tn-za", "sd-arab", "sd-arab-pk", "sd-deva", "si", "si-lk", "sk", "sk-sk", "sl", "sl-si", "es", "es-cl", "es-co", "es-es", "es-mx", "es-ar", "es-bo", "es-cr", "es-do", "es-ec", "es-gt", "es-hn", "es-ni", "es-pa", "es-pe", "es-pr", "es-py", "es-sv", "es-us", "es-uy", "es-ve", "es-019", "es-419", "sv", "sv-se", "sv-fi", "tg-arab", "tg-cyrl", "tg-cyrl-tj", "tg-latn", "ta", "ta-in", "tt-arab", "tt-cyrl", "tt-latn", "tt-ru", "te", "te-in", "th", "th-th", "ti", "ti-et", "tr", "tr-tr", "tk-cyrl", "tk-latn", "tk-tm", "tk-latn-tr", "tk-cyrl-tr", "uk", "uk-ua", "ur", "ur-pk", "ug-arab", "ug-cn", "ug-cyrl", "ug-latn", "uz", "uz-cyrl", "uz-latn", "uz-latn-uz", "vi", "vi-vn", "cy", "cy-gb", "wo", "wo-sn", "yo-latn", "yo-ng"]

function shouldLocalize(extManifest) {
    var localizeResources = false;

    if (extManifest.name.indexOf(MsgKey) == 0) {
        localizeResources = true;
    }
    if (extManifest.description.indexOf(MsgKey) == 0) {
        localizeResources = true;
    }

    return localizeResources;
}

function mapLocalesFromI18nToUWP(locale) {
    locale = locale.toLowerCase();
    if (acceptedLanguageCodes.indexOf(locale) > -1)
        return locale;

    if (locale.indexOf("_") > -1) {
        var underscoreToHyphenLocale = locale.replace("_", "-");
        if (acceptedLanguageCodes.indexOf(underscoreToHyphenLocale) > -1)
            return locale;
    }

    log.warn('The language code "' + locale + '" is not supported by the store. Skipping...', constants.platform.id);
}

function getResources(extManifest, localesList) {
    var resourceKey = "{LanguageCode}";
    var resourceTemplate = "<Resource Language=\"" + resourceKey + "\" />"

    if (!shouldLocalize)
        return "<Resource Language=\"en-us\" />";
    
    var resourceString = resourceTemplate.replace(resourceKey, extManifest.default_locale);

    for (var index = 0; index < localesList.length; index++) {
        var currentLocale = mapLocalesFromI18nToUWP(localesList[index]);
        
        if (currentLocale == extManifest.default_locale)
            continue;
        
        resourceString += "\r\n\t\t";
        resourceString += resourceTemplate.replace(resourceKey, currentLocale);
    }

    return resourceString;
}

function localizeAppxManifest(extManifest, content, extensionLocalesList) {
    if (extManifest.name.indexOf(MsgKey) == 0) {
        content = content.replace(/{DisplayName}/g, "ms-resource:DisplayName");
    }
    if (extManifest.description.indexOf(MsgKey) == 0) {
        content = content.replace(/{Description}/g, "ms-resource:Description");
    }

    var resources = getResources(extManifest, extensionLocalesList);

    return content.replace(/{Resources}/g, resources);
}

function getResObjFromLocale(extManifest, localeMessagesFile) {
    var resObj = {};
    var localeJsonString;
    var localeJson;

    try {
        localeJsonString = fs.readFileSync(localeMessagesFile).toString();
        var bomRemovedlocaleJsonString = localeJsonString.replace("\ufeff", "").replace("\uffef", "");
        if (bomRemovedlocaleJsonString != localeJsonString)
            log.warn("Removing Invalid BOM in file: " + localeMessagesFile, constants.platform.id);
            
        localeJson = JSON.parse(bomRemovedlocaleJsonString);
    }
    catch(e) {
        log.warn("Invalid JSON in file: " + localeMessagesFile, constants.platform.id);
        return resObj;
    }
        
    var nameKey = "";
    if (extManifest.name.indexOf(MsgKey) == 0) {
        nameKey = extManifest.name.replace(MsgKey, "");
        nameKey = nameKey.substring(0, nameKey.length - 2);

        if (localeJson[nameKey] && localeJson[nameKey].message && localeJson[nameKey].message.length > 0) {
            resObj["DisplayName"] = localeJson[nameKey].message;
            resObj["_DisplayName.comment"] = localeJson[nameKey].description || "";
        }
    }

    var descriptionKey = "";
    if (extManifest.description.indexOf(MsgKey) == 0) {
        descriptionKey = extManifest.description.replace(MsgKey, "");
        descriptionKey = descriptionKey.substring(0, descriptionKey.length - 2);

        if (localeJson[descriptionKey] && localeJson[descriptionKey].message && localeJson[descriptionKey].message.length > 0) {
            resObj["Description"] = localeJson[descriptionKey].message;
            resObj["_Description.comment"] = localeJson[descriptionKey].description || "";
        }
    }

    return resObj;
}

function createResJsonFiles(extManifest, localesList, manifestLocalesDir, resjsonRootDir) {
    if (extManifest.hasOwnProperty("default_locale")) {

        for (var index = 0; index < localesList.length; index++) {
            var current_locale = localesList[index];
            
            var localeMessagesFile = path.join(manifestLocalesDir, current_locale, "messages.json");    
            var resObj = getResObjFromLocale(extManifest, localeMessagesFile);
            if (typeof resObj["DisplayName"] === "undefined" && typeof resObj["Description"] === "undefined")
                continue;

            var resjsonString = JSON.stringify(resObj, null, "\t");

            var uwpLocale = mapLocalesFromI18nToUWP(current_locale);
            if (!uwpLocale)
                continue;

            var resjsonCurrentLocaleDir = path.join(resjsonRootDir, mapLocalesFromI18nToUWP(current_locale));
            var resjsonFilePath = path.join(resjsonCurrentLocaleDir, "resources.resjson")

            fs.mkdirSync(resjsonCurrentLocaleDir, { clobber: true });
            fs.writeFileSync(resjsonFilePath, resjsonString, { clobber: true });
            // create resjson file for this locale 
        }
    }
}

// search for local installation of Windows 10 Kit in the Windows registry
function getWindowsKitPath(toolname) {
  var cmdLine = 'powershell -noninteractive -Command "Get-ItemProperty \\"HKLM:\\SOFTWARE\\Microsoft\\Windows Kits\\Installed Roots\\" -Name KitsRoot10 | Select-Object -ExpandProperty KitsRoot10"';  
  return execute(cmdLine)
    .then(function (args) {
      var toolPath = path.resolve(args[0].replace(/[\n\r]/g, ''), 'bin', os.arch(), toolname);
      return fsStat(toolPath)
                .thenResolve(toolPath);
    })
    .catch(function (err) {
      return Q.reject(new Error('Cannot find the Windows 10 SDK tools.'));
    });
}

function makePriConfig(priConfigFilePath, extManifest) {
    if (os.platform() !== 'win32') {
        return Q.reject(new Error('Cannot generate a Windows Store package in the current platform.'));
    }

    if (!extManifest.hasOwnProperty("default_locale"))
        return "No defualt_local in the extension manifest: MakePriConfig failed";

    var defaultLocale = extManifest.default_locale;
    
    var toolName = 'makepri.exe';
    return getWindowsKitPath(toolName)
    .then(function (toolPath) {
        var cmdLine = '"' + toolPath + '" createconfig /cf "' + priConfigFilePath + '" /dq "' + defaultLocale + '" /pv 10.0.0 /o ';
        var deferred = Q.defer();
        exec(cmdLine, function (err, stdout, stderr) {             
            if (err) {
                var errmsg = stdout.match(/error:.*/g).map(function (item) { return item.replace(/error:\s*/, ''); });
                return errmsg ? errmsg.join('\n') : 'MakePriConfig failed.';
            }

            deferred.resolve({
                stdout: stdout,
                stderr: stderr
            });
        });        
        return deferred.promise;
    });
}

function makePriFiles(manifestDir, extManifest) {
    if (os.platform() !== 'win32') {
        return Q.reject(new Error('Cannot generate a Windows Store package in the current platform.'));
    }

    if(!fs.existsSync(path.join(manifestDir, "priconfig.xml")))
        return Q.reject(new Error("No priconfig.xml in the manifest directory: makePriFiles failed"));
    
    var toolName = 'makepri.exe';
    return getWindowsKitPath(toolName)
    .then(function (toolPath) {
        var priconfigFile = path.join(manifestDir, "priconfig.xml");
        var appxmanifestFile = path.join(manifestDir, "AppxManifest.xml");
        var resourcesPriFile = path.join(manifestDir, "resources.pri");
        var cmdLine = '"' + toolPath + '" new /pr "' + manifestDir + '" /cf "' + priconfigFile + '" /mn "' + appxmanifestFile + '" /of "' + resourcesPriFile + '" /o';
        var deferred = Q.defer();
        exec(cmdLine, function (err, stdout, stderr) {             
            if (err) {
                var errmsg = stdout.match(/error:.*/g).map(function (item) { return item.replace(/error:\s*/, ''); });
                return deferred.reject(new Error(errmsg ? errmsg.join('\n') : 'makePriFiles failed.'));
            }

            deferred.resolve({
                stdout: stdout,
                stderr: stderr
            });
        });
        return deferred.promise;
    });
}


module.exports = {
  shouldLocalize: shouldLocalize,
  localizeAppxManifest: localizeAppxManifest,
  createResJsonFiles: createResJsonFiles,
  makePriConfig: makePriConfig,
  makePriFiles: makePriFiles
};