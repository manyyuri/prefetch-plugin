const HtmlWebpackPlugin = require("html-webpack-plugin");

class PrefetchPlugin {
  constructor() {
    this.name = "prefetch-plugin";
  }
  apply(compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      const run = this.run.bind(this, compilation);
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        this.name,
        run
      );
    });
  }
  run(compilation, data, callback) {
    const chunkNames = data.plugin.options.chunks || "all";
    const excludeChunkNames = data.plugin.options.excludeChunkNames || [];
    const chunks = new Map();
    const prefetchIds = new Set();
    compilation.chunks
      .filter((chunk) => {
        const { id, name } = chunk;
        chunks.set(id, chunk);
        if (chunkNames === "all") {
          return excludeChunkNames.indexOf(name) === -1;
        }
        return (
          chunkNames.indexOf(name) !== -1 &&
          excludeChunkNames.indexOf(name) === -1
        );
      })
      .map((chunk) => {
        const children = new Set();
        // 拿到预加载模块的 id
        const childIdByOrder = chunk.getChildIdsByOrders();
        for (const chunkGroup of chunk.groupsIterable) {
          for (const childGroup of chunkGroup.childrenIterable) {
            for (const chunk of childGroup.chunks) {
              children.add(chunk.id);
            }
          }
        }
        if (
          Array.isArray(childIdByOrder.prefetch) &&
          childIdByOrder.prefetch.length
        ) {
          prefetchIds.add(...childIdByOrder.prefetch);
        }
      });
    console.log(prefetchIds);

    const publicPath = compilation.outputOptions.publicPath || "";
    if (prefetchIds.size) {
      const prefetchTags = [];
      for (let id of prefetchIds) {
        const chunk = chunks.get(id);
        const files = chunk.files;
        files.forEach((filename) => {
          prefetchTags.push(
            `<link ref="prefetch" href="${publicPath}${filename}">`
          );
        });
      }
      const prefetchTagHtml = prefetchTags.join("\n");
      if (data.html.indexOf("</head>") !== -1) {
        data.html = data.html.replace("</head>", prefetchTagHtml + "</head>");
      } else {
        data.html = data.html.replace(
          "<body>",
          "<head>" + prefetchTagHtml + "</head></body>"
        );
      }
    }
    callback(null, data);
  }
}

module.exports = PrefetchPlugin;
