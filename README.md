# ManifoldJS-EdgeExtension

## ManifoldJS Edge Extension Platform

Microsoft Edge Extension platform module for [ManifoldJS](https://github.com/manifoldjs/ManifoldJS), a tool for creating hosted web applications based on a [W3C Web App manifest](http://www.w3.org/TR/appmanifest/).

## Installation

### Prerequisites

NodeJS: Install [nodejs](https://nodejs.org/) - NodeJS includes npm

Windows 10 SDK: Included in [Visual Studio](https://www.visualstudio.com/) or Install the [standalone SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk)

### ManifoldJS

From a shell with node / npm installed
```
npm install -g manifoldjs


## Usage

### Generate appxmanifest.xml and extension directory structure from manifest.json

From a shell with node / npm installed
```
manifoldjs -m "<PATH TO EXTENSION DIRECTORY>/manifest.json" -p edgeextension -f edgeextension [-l debug]
```


### Validate appxmanifest.xml and Assets

The following can be found at the [Windows Store Portal](https://dev.windows.com/) under the "App Identity" section of your application submission.
For more help, follow the instructional video from [ManifoldJS](http://manifoldjs.com/).

The appxmanifest.xml can be found in the "Working Directory"/"Extension Name"/edgeextension/manifest folder.

Insert the correct Package Identity Name, Package Identity Publisher, and Version
```
<Identity 
	Name="INSERT-YOUR-PACKAGE-IDENTITY-NAME-HERE" 
	Publisher="CN=INSERT-YOUR-PACKAGE-IDENTITY-PUBLISHER-HERE" 
	Version="1.0.0.0" />
```

Insert the correct Publisher Display Name
```
<Properties> 
	<DisplayName>{DisplayName}</DisplayName> 
	<PublisherDisplayName>INSERT-YOUR-PACKAGE-PROPERTIES-PUBLISHERDISPLAYNAME-HERE</PublisherDisplayName>
	<Logo>Assets\StoreLogo.png</Logo> 
</Properties> 
```

To change the image assets. Replace the stock image assets in the "Working Directory"/"Extension Name"/edgeextension/manifest/Assets directory. 

If you have different names for your assets, change the names in the appxmanifest.xml.

Logo
```
<Properties> 
	<DisplayName>{DisplayName}</DisplayName> 
	<PublisherDisplayName>INSERT-YOUR-PACKAGE-PROPERTIES-PUBLISHERDISPLAYNAME-HERE</PublisherDisplayName>
	<Logo>Assets\StoreLogo.png</Logo> 
</Properties> 
```

Square150x150Logo and Square44x44Logo
```
<uap:VisualElements
	AppListEntry="none"
	DisplayName="{DisplayName}"
	Square150x150Logo="Assets\Square150x150Logo.png"
	Square44x44Logo="Assets\Square44x44Logo.png"
	Description="{Description}"
	BackgroundColor="transparent">
</uap:VisualElements>
```

### Generate the Appx Package
From a shell with node / npm installed
```
manifoldjs package <EXTENSION NAME>/edgeextension/manifest  [-l debug]
```

## Documentation
To get started, visit the ManifoldJS [wiki](https://github.com/manifoldjs/ManifoldJS/wiki).

## Microsoft Open Source Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

>manifoldjs-edgeextension

>Copyright (c) Microsoft Corporation

>All rights reserved.

>MIT License

>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the ""Software""), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

>THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
