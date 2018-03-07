// load the reusable legacy webpack config from materia-widget-dev
let baseConfig = require('materia-widget-development-kit/webpack-widget').getLegacyWidgetBuildConfig()

let path = require('path')
srcPath = path.join(__dirname, 'src')
baseConfig.entry['draw.js'] = [path.join(srcPath, 'draw.coffee')]

module.exports = baseConfig
