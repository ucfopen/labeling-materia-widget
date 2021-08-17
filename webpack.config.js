const fs = require('fs')
const path = require('path')
const outputPath = path.join(process.cwd(), 'build')

const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const copy = widgetWebpack.getDefaultCopyList()
const rules = widgetWebpack.getDefaultRules()

const entries = {
	'creator.js': [
		path.join(__dirname, 'src', 'spectrum.custom.js'),
		path.join(__dirname, 'src', 'draw.js'),
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

// const babelLoaderWithPolyfillRule = {
// 	test: /\.js$/,
// 	exclude: /node_modules/,
// 	use: {
// 		loader: 'babel-loader',
// 		options: {
// 			presets: ['@babel/preset-env']
// 		}
// 	}
// }

const moduleRules = [
	rules.loaderDoNothingToJs,
	rules.loadAndCompileMarkdown,
	rules.copyImages,
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.loadAndPrefixCSS,
	rules.loadAndPrefixSASS,
	// babelLoaderWithPolyfillRule
]

const options = {
	entries: entries,
	copyList: customCopy,
	moduleRules: moduleRules,
}

let buildConfig = widgetWebpack.getLegacyWidgetBuildConfig(options)
module.exports = buildConfig

// module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)

// WEBPACK starter example
// const path = require('path');

// const config = {
// 	entry: './path/to/my/entry/file.js',
// 	output: {
// 		path: path.resolve(__dirname, 'dist'),
// 		filename: 'my-first-webpack.bundle.js'
// 	},
// 	module: {
// 		rules: [
// 			{ test: /\.txt$/, use: 'raw-loader' }
// 		]
// 	},
// 	plugins: [
// 		new webpack.optimize.UglifyJsPlugin(),
// 		new HtmlWebpackPlugin({ template: './src/index.html' })
// 	]
// };

// module.exports = config;