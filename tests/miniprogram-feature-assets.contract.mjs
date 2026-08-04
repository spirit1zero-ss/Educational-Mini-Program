import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const miniRoot = new URL('../homepage-home-v1/miniprogram/', import.meta.url)
const files = [
  'packages/features/pages/module-2-logic/module-2-logic.js',
  'packages/features/pages/module-3-habit/module-3-habit.js',
  'packages/features/pages/module-4-drive/module-4-drive.js',
  'packages/features/pages/module-5-camp/module-5-camp.js',
]

for (const file of files) {
  const source = await readFile(new URL(`../homepage-home-v1/miniprogram/${file}`, import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\.\.\/\.\.\/assets\//, `${file} must not use device-sensitive relative asset paths`)
  assert.doesNotMatch(source, /illustrations\/[^"']+\.webp/i, `${file} must use real-device-safe PNG illustrations`)

  const assets = [...source.matchAll(/["'](\/packages\/features\/assets\/[^"']+\.(?:png|jpe?g|webp))["']/gi)]
    .map((match) => match[1])
  assert.ok(assets.length > 0, `${file} must declare packaged feature assets`)

  for (const asset of assets) {
    const target = new URL(`.${asset}`, miniRoot)
    assert.equal(existsSync(fileURLToPath(target)), true, `missing packaged asset: ${asset}`)
  }
}

console.log('miniprogram feature assets contract passed')
