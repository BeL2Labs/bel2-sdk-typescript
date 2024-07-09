import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

// TODO: very basic config. Check the elastos DID JS SDK for a more advanced config.
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
      resolve(),
      commonjs(),
      json(),
      typescript({
        tsconfig: 'tsconfig.json',
      }),
    ],
    onwarn: (warning, warn) => {
      // Ignore the "this is undefined" warning for aes-js
      if (warning.code === 'THIS_IS_UNDEFINED' && /aes-js/.test(warning.message))
        return;

      warn(warning);
    }
  },
];