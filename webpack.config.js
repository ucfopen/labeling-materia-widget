const path = require('path')
const outputPath = path.join(process.cwd(), 'build')

const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const copy = widgetWebpack.getDefaultCopyList()
const rules = widgetWebpack.getDefaultRules()

const webpack = require('webpack');

const entries = {
	'creator.js': [
		path.join(__dirname, 'src', 'spectrum.custom.js'),
		path.join(__dirname, 'src', 'draw.js'),
		path.join(__dirname, 'src', 'core3D.js'),
		path.join(__dirname, 'src', 'creator.js')
	],
	'player.js': [
		path.join(__dirname, 'src', 'draw.js'),
		path.join(__dirname, 'src', 'player.js'),
		path.join(__dirname, 'src', 'player.html'),
	],
	'core3D.js': [
		path.join(__dirname, 'src', 'core3D.js'),
	],
	'creator.css': [
		path.join(__dirname, 'src', 'creator.html'),
		path.join(__dirname, 'src', 'creator.scss')
	],
	'player.css': [
		path.join(__dirname, 'src', 'player.html'),
		path.join(__dirname, 'src', 'player.scss')
	],
	'guides/guideStyles.css': [
		path.join(__dirname, 'src', '_guides', 'guideStyles.scss'),
	],
	'guides/player.temp.html': [
		path.join(__dirname, 'src', '_guides', 'player.md')
	],
	'guides/creator.temp.html': [
		path.join(__dirname, 'src', '_guides', 'creator.md')
	]
}

const customCopy = copy.concat([
	{
		from: path.join(__dirname, 'src', '_guides', 'assets'),
		to: path.join(outputPath, 'guides', 'assets'),
		toType: 'dir'
	},
	{
		from: path.join(__dirname, 'src', 'models3D'),
		to: path.join(outputPath, 'models3D'),
		toType: 'dir'
	},
	{
		from: path.join(__dirname, 'node_modules', 'three'),
		to: path.join(outputPath, 'node_modules', 'three'),
		toType: 'dir'
	},
])

/*
I get different ERRORS based on how "modules": "", is configure.
"auto" --> Uncaught ReferenceError: exports is not defined at core3D.js:3

"commonjs" --> core3D.js:3 Uncaught ReferenceError: exports is not defined at core3D.js:3
								|==> In function setUp3DEnvironment()
					---> ReferenceError: require is not defined at creator.js:3115
*/
const useBabelLoader = {
	test: /\.js$/,
	exclude: /node_modules/,
	use: {
		loader: 'babel-loader',
		options: {
			presets: ['@babel/preset-env'],
			plugins: [
				["@babel/plugin-transform-modules-commonjs", {
					"allowTopLevelThis": true,
					"loose": true,
				}],
			],
		}
	}
}

const moduleRules = [
	rules.loaderDoNothingToJs,
	rules.loadAndCompileMarkdown,
	rules.copyImages,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.loadAndPrefixCSS,
	rules.loadAndPrefixSASS,
	useBabelLoader,
]

const options = {
	entries: entries,
	copyList: customCopy,
	moduleRules: moduleRules,
}

let buildConfig = widgetWebpack.getLegacyWidgetBuildConfig(options)

// possible CDN future, would require an intermediate 'loading resources' screen due to long load times
// buildConfig.externals = {
// 	'https://unpkg.com/three@0.124.0/build/three.module.js': 'https://unpkg.com/three@0.124.0/build/three.module.js',
// 	'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js': 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js',
// 	'https://unpkg.com/three@0.124.0/examples/jsm/loaders/MTLLoader.js': 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/MTLLoader.js',
// 	'https://unpkg.com/three@0.124.0/examples/jsm/loaders/OBJLoader.js': 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/OBJLoader.js',
// 	'https://unpkg.com/three@0.124.0/examples/jsm/libs/stats.module.js': 'https://unpkg.com/three@0.124.0/examples/jsm/libs/stats.module.js'
// }

buildConfig.externals = {
	'https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.module.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.module.min.js',
	'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js': 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js',
	'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/MTLLoader.js': 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/MTLLoader.js',
	'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/OBJLoader.js': 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/OBJLoader.js',
	'https://unpkg.com/three@0.124.0/examples/jsm/libs/stats.module.js': 'https://unpkg.com/three@0.124.0/examples/jsm/libs/stats.module.js'
}

module.exports = buildConfig
// module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
