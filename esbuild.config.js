import fs from 'node:fs'
import { build } from 'esbuild'

await build({
   entryPoints: ['./src/cli.ts'],
   bundle: true,
   platform: 'node',
   format: 'cjs',
   outfile: './dist/cli.cjs',
})

await build({
   entryPoints: ['./src/github-action.ts'],
   bundle: true,
   platform: 'node',
   format: 'cjs',
   outfile: './dist/github-action.cjs',
})

const wasmFile = fs.readFileSync(
   './node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm',
)

fs.writeFileSync('./dist/tiktoken_bg.wasm', wasmFile)
