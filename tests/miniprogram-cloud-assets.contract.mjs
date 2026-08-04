import assert from 'node:assert/strict'
import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const uploadRoot = join(root, 'homepage-home-v1', 'cloud-storage-upload')
const miniRoot = join(root, 'homepage-home-v1', 'miniprogram')
const manifest = JSON.parse(await readFile(join(uploadRoot, 'upload-manifest.json'), 'utf8'))
const cloudAssetsSource = await readFile(
  join(miniRoot, 'packages', 'features', 'utils', 'cloud-assets.js'),
  'utf8'
)

assert.equal(manifest.environmentId, 'prod-d0ge2jwpgc0db67eb')
assert.equal(manifest.storageRoot, '7072-prod-d0ge2jwpgc0db67eb-1453312076')
assert.equal(manifest.cloudDirectory, 'miniapp-assets/v1')
assert.equal(manifest.files.length, 25)
assert.equal(new Set(manifest.files).size, manifest.files.length, 'cloud upload paths must be unique')

for (const file of manifest.files) {
  const uploadFile = join(uploadRoot, manifest.cloudDirectory, file)
  assert.equal(existsSync(uploadFile), true, `missing upload asset: ${file}`)
  assert.ok(statSync(uploadFile).size > 0, `empty upload asset: ${file}`)
  assert.match(cloudAssetsSource, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
}

assert.match(
  cloudAssetsSource,
  /cloud:\/\/prod-d0ge2jwpgc0db67eb\.7072-prod-d0ge2jwpgc0db67eb-1453312076\/miniapp-assets\/v1\//
)
assert.match(cloudAssetsSource, /wx\.cloud\.getTempFileURL/)
assert.match(cloudAssetsSource, /restoreLocalAsset/)

const require = createRequire(import.meta.url)
globalThis.wx = {
  cloud: {
    getTempFileURL({ fileList, success }) {
      success({
        fileList: fileList.map((fileID) => ({
          fileID,
          tempFileURL: `https://example.test/${fileID.split('/').pop()}`,
        })),
      })
    },
  },
}
const cloudAssets = require(join(miniRoot, 'packages', 'features', 'utils', 'cloud-assets.js'))
const resolved = await cloudAssets.resolveCloudAssetFields({ heroTreeImage: 'module2.heroTree' })
assert.equal(resolved.heroTreeImage, 'https://example.test/hero-tree-v3.png')
delete globalThis.wx

const pages = [
  'module-2-logic/module-2-logic',
  'module-3-habit/module-3-habit',
  'module-4-drive/module-4-drive',
  'module-5-camp/module-5-camp',
  'module-b-assessment/module-b-assessment',
  'module-b-inline/module-b-inline',
]

for (const page of pages) {
  const js = await readFile(join(miniRoot, 'packages', 'features', 'pages', `${page}.js`), 'utf8')
  const wxml = await readFile(join(miniRoot, 'packages', 'features', 'pages', `${page}.wxml`), 'utf8')
  assert.match(js, /applyCloudAssets\(this, CLOUD_ASSET_FIELDS\)/, `${page} must resolve cloud assets`)
  assert.match(js, /restoreLocalAsset\(this, event, LOCAL_ASSETS\)/, `${page} must restore local assets`)
  assert.match(wxml, /binderror="onCloudImageError"/, `${page} must handle remote image failures`)
}

const localHero = join(
  miniRoot,
  'packages',
  'features',
  'assets',
  'module-2-logic',
  'illustrations',
  'hero-tree-v3.png'
)
const cloudHero = join(uploadRoot, manifest.cloudDirectory, 'module-2', 'hero-tree-v3.png')
assert.ok(statSync(cloudHero).size > statSync(localHero).size, 'cloud hero must retain more image detail than fallback')

console.log('miniprogram cloud assets contract passed')
