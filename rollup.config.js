import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'

export default [
  {
    input: 'src/index.ts',
    output: {
      name: 'Sval',
      file: 'dist/sval.js',
      globals: {
        meriyah: 'meriyah'
      }
    },
    external: ['meriyah'],
    plugins: [
      json(),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            target: 'esnext'
          }
        }
      })
    ]
  },
]