'use strict';

var manifest = require('../../lib/manifest');

module.exports = function (manifestContent, callback) {
    var content = '<?xml version="1.0" encoding="utf-8"?> \
<Package \
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10" \
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10" \
  xmlns:uap3="http://schemas.microsoft.com/appx/manifest/uap/windows10/3" \
  IgnorableNamespaces="uap3"> \
  \
  <Identity \
    Name="[REPLACE WITH PACKAGE/IDENTITYNAME]" \
    Publisher="[REPLACE WITH PACKAGE/IDENTITY/PUBLISHER]" \
    Version="[REPLACE WITH PACKAGE VERSION in the form X.X.X.0]"/> \
\
  <Properties> \
    <DisplayName>[REPLACE WITH RESERVED STORE NAME]</DisplayName> \
    <PublisherDisplayName>[REPLACE WITH PACKAGE/PROPERTIES/PUBLISHERDISPLAYNAME]</PublisherDisplayName> \
    <Logo>[REPLACE WITH RELATIVE PATH TO 50x50 ICON]</Logo> \
  </Properties> \
\
  <Dependencies> \
    <TargetDeviceFamily Name="Windows.Desktop" \
      MinVersion="10.0.14393.0" \
      MaxVersionTested="10.0.14800.0" /> \
  </Dependencies> \
\
  <Resources> \
    <Resource Language="en-us"/> \
  </Resources> \
\
  <Applications> \
    <Application Id="App"> \
      <uap:VisualElements  \
        AppListEntry="none" \
        DisplayName="[REPLACE WITH RESERVED STORE NAME]" \
        Square150x150Logo="[REPLACE WITH RELATIVE PATH TO 150x150 ICON]" \
        Square44x44Logo="[REPLACE WITH RELATIVE PATH TO 44x44 ICON]" \
        Description="This is the description of the extension" \
        BackgroundColor="white"> \
      </uap:VisualElements> \
      <Extensions> \
      <uap3:Extension Category="windows.appExtension"> \
        <uap3:AppExtension Name="com.microsoft.edge.extension" \
          Id="EdgeExtension" \
          PublicFolder="Extension" \
          DisplayName="[REPLACE WITH RESERVED STORE NAME]"> \
        </uap3:AppExtension> \
      </uap3:Extension> \
      </Extensions> \
 </Application> \
</Applications> \
</Package>';
    var locales = 'en-us';

    try {
        manifest.replaceManifestValues(manifestContent, content, locales);
        callback(undefined, undefined);
    } catch (e) {
        callback(e, undefined);
    }
};