import assert from 'node:assert/strict'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const miniRoot = join(root, 'homepage-home-v1', 'miniprogram')
const featureRoot = join(miniRoot, 'packages', 'features')

function directorySize(dir, ignoredNames = new Set()) {
  return readdirSync(dir).reduce((total, name) => {
    if (ignoredNames.has(name)) return total
    const target = join(dir, name)
    const stat = statSync(target)
    return total + (stat.isDirectory() ? directorySize(target, ignoredNames) : stat.size)
  }, 0)
}

const featureUtils = [
  'module-a-results.js',
  'module-b-results.js',
  'profile-avatar.js',
  'virtual-payment.js',
]

for (const name of featureUtils) {
  assert.equal(existsSync(join(miniRoot, 'utils', name)), false, `${name} must not remain in the main package`)
  assert.equal(existsSync(join(featureRoot, 'utils', name)), true, `${name} must exist in the feature subpackage`)
}

const pageSources = await Promise.all([
  'camp-checkout/camp-checkout.js',
  'camp-orders/camp-orders.js',
  'profile-editor/profile-editor.js',
  'module-a-assessment/module-a-assessment.js',
  'module-a-result/module-a-result.js',
  'module-b-assessment/module-b-assessment.js',
  'module-b-inline/module-b-inline.js',
  'module-b-result/module-b-result.js',
].map((path) => readFile(join(featureRoot, 'pages', path), 'utf8')))

for (const source of pageSources) {
  assert.doesNotMatch(source, /\.\.\/\.\.\/\.\.\/\.\.\/utils\/(?:module-[ab]-results|profile-avatar|virtual-payment)/)
}

const assessmentImage = join(featureRoot, 'assets', 'doc-images', 'ABC-04.jpg')
assert.ok(statSync(assessmentImage).size <= 200 * 1024, 'assessment image must stay at or below 200KB')

const mainSize = directorySize(miniRoot, new Set(['packages', 'miniprogram_npm']))
const featureSize = directorySize(featureRoot)
assert.ok(mainSize <= 1.5 * 1024 * 1024, `main package source is too large: ${mainSize} bytes`)
assert.ok(featureSize <= 2 * 1024 * 1024, `feature subpackage source is too large: ${featureSize} bytes`)

console.log(`miniprogram package quality passed (main: ${mainSize}, feature: ${featureSize})`)
