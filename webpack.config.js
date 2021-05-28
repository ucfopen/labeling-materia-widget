const fs = require('fs')
const path = require('path')
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const copy = widgetWebpack.getDefaultCopyList()

const outputPath = path.join(process.cwd(), 'build')

const customCopy = copy.concat([
	{
		from: path.join(__dirname, 'src', '_guides', 'assets'),
		to: path.join(outputPath, 'guides', 'assets'),
		toType: 'dir'
	},
	{
		from: path.join(__dirname, 'src', '_models3D'),
		to: path.join(outputPath, '_models3D'),
		toType: 'dir'
	},
])

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
		path.join(__dirname, 'src', 'lib', 'three.js'),
		path.join(__dirname, 'src', 'lib', 'MTLLoader.js'),
		path.join(__dirname, 'src', 'lib', 'OBJLoader.js'),
		path.join(__dirname, 'src', 'lib', 'OrbitControls.js'),
		path.join(__dirname, 'src', 'lib', 'stats.js'),
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

const options = {
	copyList: customCopy,
	entries: entries
}

let buildConfig = widgetWebpack.getLegacyWidgetBuildConfig(options)
module.exports = buildConfig

// module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
