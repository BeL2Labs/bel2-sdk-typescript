import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: 'json' };
// import tsconfig from './tsconfig.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      json({}),
      resolve(),
      commonjs(),
      typescript({
        declaration: false, // Ensure Rollup does not emit declaration files
      }),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      "ethersv5",
      "ethersv6"
    ], // Don't pack all dependencies that are in package.json
    onwarn: (warning, warn) => {
      // Ignore the "this is undefined" warning for aes-js
      if (warning.code === 'THIS_IS_UNDEFINED' && /aes-js/.test(warning.message))
        return;

      warn(warning);
    }
  },
];