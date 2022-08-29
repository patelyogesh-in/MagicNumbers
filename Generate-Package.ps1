
dotnet new tool-manifest --force
dotnet nuget add source -n Sitecore https://sitecore.myget.org/F/sc-packages/api/v3/index.json
dotnet tool install Sitecore.CLI --version 4.2.1


Write-Host "Starting items package generation...";

dotnet sitecore ser pkg create -o serialized-items

Write-Host "Created items package...";