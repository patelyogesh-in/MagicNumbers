module.exports = function () {
    var config = {
        environment: "ADO",
		webRoot: "./Output",
		identityServerRoot: "NA",
		horizonRoot: "NA",
		xConnectRoot: "NA",
        devRoot: "$(Build.SourcesDirectory)",
        solutionName: "ExtremeNetworks",
        buildConfiguration: "Release",
        MSBuildToolsVersion: 17,
		buildMaxCpuCount: 1,
        buildVerbosity: "minimal",
        buildPlatform: "Any CPU",
        publishPlatform: "AnyCpu",
        runCleanBuilds: false
    }
    return config;
}