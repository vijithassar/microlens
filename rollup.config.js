import buble from 'rollup-plugin-buble'

const config = {
  input: "./index.js",
  output: {
    file: "./build/microlens.js",
    format: "umd",
    name: "microlens",
    sourcemap: true
  },
  plugins: [
    buble()
  ]
}

export default config
