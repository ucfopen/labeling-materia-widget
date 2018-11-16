const path = require('path')
const srcPath = path.join(__dirname, 'src') + path.sep
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const entries = widgetWebpack.getDefaultEntries()

entries['player.js'] = [
	srcPath+'player.coffee',
	srcPath+'draw.coffee'
]

entries['creator.js'] = [
	srcPath+'creator.coffee',
	srcPath+'draw.coffee',
	srcPath+'spectrum.custom.js'
]

// options for the build
let options = {
	entries: entries
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
