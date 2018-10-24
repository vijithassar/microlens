import buble from 'rollup-plugin-buble'
import { uglify } from 'rollup-plugin-uglify'

const config = {
  input: "./index.js",
  output: {
    file: "./build/microlens.js",
    format: "umd",
    name: "microlens",
    sourcemap: true
  },
  plugins: [
    buble(),
    uglify()
  ]
}

export default config
