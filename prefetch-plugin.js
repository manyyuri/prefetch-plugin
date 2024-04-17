const HtmlWebpackPlugin = require('html-webpack-plugin');

class PrefetchPlugin{
    constructor(){
        this.name = 'prefetch-plugin';
    }
    apply(compiler){
        compiler.hooks.compilation.tap(this.name, compilation=>{
            const run = this.run.bind(this, compilation);
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(this.name, run);
        })
    }
    run(compilation, data, callback){
        const chunkNames = data.plugin.options.chunks || 'all';
    }
}

export default PrefetchPlugin