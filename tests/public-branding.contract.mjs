import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

const sourceManifest = JSON.parse(read('src/CRMEB/CRMEB-master/template/admin/public/manifest.json'))
const builtManifest = JSON.parse(read('src/CRMEB/CRMEB-master/crmeb/public/admin/manifest.json'))
const builtIndex = read('src/CRMEB/CRMEB-master/crmeb/public/admin/index.html')
const router = read('src/CRMEB/CRMEB-master/template/admin/src/router/routers.js')
const theme = read('src/CRMEB/CRMEB-master/template/admin/src/store/module/themeConfig.js')

assert.equal(sourceManifest.name, '自主学习训练营管理后台')
assert.equal(builtManifest.name, sourceManifest.name)
assert.match(builtIndex, /<title>自主学习训练营管理后台<\/title>/)
assert.match(router, /title: '自主学习训练营管理后台'/)
assert.match(theme, /globalTitle: '自主学习训练营管理后台'/)

const requiredAssets = [
  'src/CRMEB/CRMEB-master/crmeb/public/statics/system_images/admin_logo_big.png',
  'src/CRMEB/CRMEB-master/crmeb/public/statics/system_images/admin_logo_small.png',
  'src/CRMEB/CRMEB-master/crmeb/public/statics/system_images/admin_login_logo.png',
  'src/CRMEB/CRMEB-master/crmeb/public/statics/system_images/default_avatar.jpeg',
  'src/CRMEB/CRMEB-master/template/admin/src/assets/images/sw.png',
  'src/CRMEB/CRMEB-master/crmeb/public/admin/favicon.ico',
]

for (const asset of requiredAssets) {
  const path = join(root, asset)
  assert.equal(existsSync(path), true, `missing brand asset: ${asset}`)
  assert.ok(statSync(path).size > 512, `brand asset is unexpectedly small: ${asset}`)
}

const databasePatch = read('src/CRMEB/CRMEB-master/crmeb/database/patches/2026-08-04-public-branding.sql')
assert.doesNotMatch(databasePatch, /^\s*USE\s+/im, 'cloud patch must not require USE privilege')
assert.match(databasePatch, /nickname` = 'CRMEB'/)
assert.match(databasePatch, /real_name` = 'CRMEB'/)

const license = read('src/CRMEB/CRMEB-master/crmeb/LICENSE.txt')
const copyrightComponent = read('src/CRMEB/CRMEB-master/template/admin/src/components/copyright/index.vue')
assert.match(license, /CRMEB/)
assert.match(copyrightComponent, /https:\/\/www\.crmeb\.com/)

console.log('public branding contract checks passed')
