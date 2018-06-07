const path = require('path')
const fs = require('fs')
const bfj = require('bfj-node4')

function filesdependences (opts) {
  this.opts = Object.assign({
    filename: 'manifest.json',
    filepath: './src/manifest.json'
  }, opts)
}

filesdependences.prototype.apply = function (compiler) {

  const done = stats => {
    stats = stats.toJson()
    const manifestPath = this.opts.filepath
    const manifest = JSON.parse(fs.readFileSync(manifestPath).toString())
    if (stats && stats.entrypoints) {
      Object.keys(stats.entrypoints).forEach(name => {
        const assets = stats.entrypoints[name].assets
        let routerName = name.lastIndexOf('/') > -1 ? name.substr(0, name.lastIndexOf('/')) : name
        if (manifest && manifest.router) {
          const pages = manifest.router.pages
          if (pages[routerName] && assets) {
            pages[routerName]['dependences'] = assets.filter(name => {
              if(path.extname(name) === '.js') return true
            })
          }
        }
      })
    }

    const manifestFilepath =  path.resolve(compiler.outputPath, this.opts.filename)
    try {
      bfj.write(manifestFilepath, manifest,{
        space: 2,
        promises: 'ignore',
        buffers: 'ignore',
        maps: 'ignore',
        iterables: 'ignore',
        circular: 'ignore'
      });
    } catch (error) {
      console.log('error');
    }
  }
  compiler.plugin('done',done)
}
module.exports = filesdependences