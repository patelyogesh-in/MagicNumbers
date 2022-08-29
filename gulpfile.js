// from hb
var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var header = require('gulp-header');
var exec = require("child_process").exec;


// from k
var fs = require('fs');
var nugetRestore = require('gulp-nuget-restore');
var path = require('path')
var newer = require("gulp-newer");

// from bp
var msbuild = require("gulp-msbuild");
var debug = require("gulp-debug");
var foreach = require("gulp-foreach");
var runSequence = require("gulp4-run-sequence");

// var gulpConfig = require("./gulp-config.js")();
// module.exports.config = gulpConfig;

var gulpConfig;
if (fs.existsSync('./gulp-config.js.user')) {
    gulpConfig = require("./gulp-config.js.user")();
}
else {
    gulpConfig = require("./gulp-config.js")();
}

module.exports.config = gulpConfig;



// For CI-CD
gulp.task("Publish-All-Projects", function (callback) {

    if(process.argv.length > 3 )
	{
		var sourceDir = process.argv[4];
		//var artifactsDir = process.argv[6];
		
		gulpConfig.devRoot = sourceDir;
		//gulpConfig.webRoot = artifactsDir;
	}

    console.log("Initial path: " + gulpConfig.webRoot);
    console.log("Resolved path: " + path.resolve(gulpConfig.webRoot));

    gulpConfig.webRoot = path.resolve(gulpConfig.webRoot);

    console.log("Final Destination path: " + gulpConfig.webRoot);


    return runSequence(
		"Nuget-Restore",
        "Build-Solution",
        "Publish-Foundation-Projects",
        "Publish-Feature-Projects",
        "Publish-Project-Projects",
		"Copy-Asset-Files",
        "Copy-Environment-Files", callback);
});

// For Local
gulp.task("Local-Publish-All-Projects", function (callback) {

    if(process.argv.length > 3 )
	{
		var sourceDir = process.argv[4];
		//var artifactsDir = process.argv[6];
		
		gulpConfig.devRoot = sourceDir;
		//gulpConfig.webRoot = artifactsDir;
	}

    console.log("Initial path: " + gulpConfig.webRoot);
    console.log("Resolved path: " + path.resolve(gulpConfig.webRoot));

    gulpConfig.webRoot = path.resolve(gulpConfig.webRoot);

    console.log("Final Destination path: " + gulpConfig.webRoot);

     return runSequence(
		"Nuget-Restore",
        "Build-Solution",
        "Publish-Foundation-Projects",
        "Publish-Feature-Projects",
        "Publish-Project-Projects",
		"Copy-Asset-Files",
        "Copy-Local-Environment-Files", callback);
});


var publishProjects = function (location, dest) {
    dest = dest || gulpConfig.webRoot;
	
	if(gulpConfig.environment == "ADO") // Not Local, ADO Pipelines
		dest = dest + '/WebRoot';

    console.log("publish to " + dest + " folder");
    return gulp.src([location + "/**/code/*.csproj"])
        .pipe(foreach(function (stream, file) {
            return publishStream(stream, dest);
        }));
};

var publishStream = function (stream, dest) {
    var targets = ["Build"];

    return stream
        .pipe(debug({ title: "Building project:" }))
        .pipe(msbuild({
            targets: targets,
            configuration: gulpConfig.buildConfiguration,
            logCommand: false,
            verbosity: gulpConfig.buildVerbosity,
            stdout: true,
            errorOnFail: true,
            maxcpucount: gulpConfig.buildMaxCpuCount,
            nodeReuse: false,
            toolsVersion: gulpConfig.buildToolsVersion,
            properties: {
                Platform: gulpConfig.publishPlatform,
                DeployOnBuild: "true",
                PublishProfile: "Local",
                DeployDefaultTarget: "WebPublish",
                WebPublishMethod: "FileSystem",
                DeleteExistingFiles: "false",
                publishUrl: dest,
                _FindDependencies: "false"
            }
        }));
}

gulp.task("Nuget-Restore", function (callback) {
    var solution = "./" + gulpConfig.solutionName + ".sln";
    return gulp.src(solution).pipe(nugetRestore());
});

gulp.task("Build-Solution", function () {
    var targets = ["Build"];

    return gulp.src("./" + gulpConfig.solutionName + ".sln")
        .pipe(msbuild({
            targets: targets,
            configuration: gulpConfig.buildConfiguration,
            logCommand: false,
            verbosity: "minimal",
            stdout: true,
            errorOnFail: true,
            maxcpucount: 0,
            toolsVersion: gulpConfig.MSBuildToolsVersion
        }));
});

gulp.task("Publish-Foundation-Projects", function () {
    return publishProjects("./src/Foundation");
});

gulp.task("Publish-Feature-Projects", function () {
    return publishProjects("./src/Feature");
});

gulp.task("Publish-Project-Projects", function () {
	console.log("Starting publishing Project projects...");
    return publishProjects("./src/Project");
});
gulp.task("Copy-Environment-Files", function () {
	return gulp.src('./EnvironmentFiles/**/*.*')
        .pipe(gulp.dest(gulpConfig.webRoot + '/Outputs'));   
});

gulp.task("Copy-Asset-Files", function () {
	var dest = gulpConfig.webRoot;
	if(gulpConfig.environment == "ADO") // Not Local, ADO Pipelines
		dest = dest + '/WebRoot';
	return gulp.src('./FED/dist/**/*.*')
        .pipe(gulp.dest(dest));   
});

gulp.task("Copy-Local-Environment-Files", function (callback) {
	gulp.src('./EnvironmentFiles/Core/Local/*.*').pipe(gulp.dest(gulpConfig.webRoot));
	gulp.src('./EnvironmentFiles/IdentityServer/Local/**/*.*').pipe(gulp.dest(gulpConfig.identityServerRoot));
	// We can add Horizon and xConnect file copy if required...
	callback();
});
gulp.task("Local-Copy-All-Views", function () {
    var root = "./src";
    var roots = [root + "/**/Views", "!" + root + "/**/obj/**/Views"];
    var files = "/**/*.cshtml";
    var destination = gulpConfig.webRoot + "\\Views";
    return gulp.src(roots, { base: root }).pipe(
        foreach(function (stream, file) {
            console.log("Publishing from " + file.path);
            gulp.src(file.path + files, { base: file.path })
                .pipe(newer(destination))
                .pipe(debug({ title: "Copying " }))
                .pipe(gulp.dest(destination));
            return stream;
        })
    );
});

/* Add items to package definition */

// gulp.task('Package-Items', function () {
    // return exec("Powershell.exe  -executionpolicy remotesigned .\\scripts\\Serialization\\Generate-Package.ps1");
	
	 // /*console.log(gulpConfig.webRoot);
	 // return gulp.src('./serialized-items.itempackage')
         // .pipe(gulp.dest(gulpConfig.webRoot + '/Outputs'));
    // */
// });