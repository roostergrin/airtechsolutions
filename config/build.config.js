export default {
  postcss: {
    preset: {
      autoprefixer: {
        grid: true
      }
    }
  },
  loaders: {
    sass: {
      sassOptions: {
        silenceDeprecations: ['slash-div', 'global-builtin', 'import', 'legacy-js-api']
      }
    }
  },
  extend (config, ctx) {
    config.module.rules
      .filter(moduleRules => moduleRules.test.toString().includes('svg'))
      .forEach((rule) => { rule.test = /\.(png|jpe?g|gif)$/ })
    // urlLoader.test = /\.(png|jpe?g|gif)$/
    config.module.rules.push({
      test: /\.svg$/,
      loader: 'svg-inline-loader',
      exclude: /node_modules/,
      options: {
        // svg-inline-loader strips width/height off the root <svg> by default,
        // leaving only a viewBox. Safari then cannot derive the missing
        // dimension when CSS sizes one axis, so logos expanded to fill their
        // flex line. CSS width/height still override these attributes.
        removeSVGTagAttrs: false
      }
    })
  }
}
