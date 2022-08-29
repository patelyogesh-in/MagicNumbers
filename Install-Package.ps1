$package = "$env:System_DefaultWorkingDirectory/_Web Replatforming/ItemPackage/serialized-items.itempackage"

Write-Host "Package file: " + $package

Write-Host "Install Manifest"
dotnet new tool-manifest

Write-Host "Install CLI"
dotnet nuget add source -n "Sitecore NuGet Feed" https://sitecore.myget.org/F/sc-packages/api/v3/index.json
dotnet tool install Sitecore.CLI --version 4.2.1

Write-Host "Sitecore INIT"
dotnet sitecore init

Write-Host "Sitecore Plugin Install Serialization"
dotnet sitecore plugin add -n Sitecore.DevEx.Extensibility.Serialization --version 4.2.1


Write-Host "Package installation started...";
dotnet sitecore ser pkg install -f $package --client-id #{scs-ClientId}# --client-secret #{scs-ClientSecret}# --authority #{si-Url}# --cm #{cm-Url}#

Write-Host "Package installation completed ..";