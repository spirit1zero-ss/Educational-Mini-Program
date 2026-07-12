import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const adminSource = path.join(
  projectRoot,
  'src',
  'CRMEB',
  'CRMEB-master',
  'template',
  'admin',
  'src'
)

const retiredPaths = [
  'pages/product',
  'pages/order',
  'pages/marketing',
  'pages/division',
  'pages/crud',
  'pages/setting/devise',
  'pages/setting/userFile',
  'pages/system/backendRouting',
  'pages/system/clear',
  'pages/system/codeDataDictionary',
  'pages/system/codeGeneration',
  'pages/system/crossVersionUpgrade',
  'pages/system/file',
  'pages/system/onlineUpgrade',
  'pages/system/maintain/systemFile',
  'pages/system/maintain/systemCleardata',
  'pages/index/components/visitChart.vue',
  'components/CustomDesign',
  'components/diyComponents',
  'components/goodsList',
  'components/linkaddress',
  'components/mobileConfig',
  'components/mobileConfigRight',
  'components/mobilePage',
  'components/uploadVideo',
  'components/uploadVideo2',
  'components/uploadVideos',
  'api/product.js',
  'api/marketing.js',
  'api/lottery.js',
  'api/cms.js',
  'api/kefu.js',
  'api/crud.js'
]

const requiredPaths = [
  'pages/account/login',
  'pages/user',
  'pages/agent',
  'pages/finance',
  'pages/setting/membershipLevel',
  'pages/system/configTab',
  'components/wangEditor',
  'components/uploadPictures'
]

for (const relativePath of retiredPaths) {
  const target = path.join(adminSource, ...relativePath.split('/'))
  if (fs.existsSync(target)) {
    throw new Error(`Retired admin surface returned: ${relativePath}`)
  }
}

for (const relativePath of requiredPaths) {
  const target = path.join(adminSource, ...relativePath.split('/'))
  if (!fs.existsSync(target)) {
    throw new Error(`Required admin surface is missing: ${relativePath}`)
  }
}

const sourceFiles = []
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (['.js', '.vue'].includes(path.extname(entry.name))) {
      sourceFiles.push(fullPath)
    }
  }
}
walk(adminSource)

const forbiddenImports = [
  '@/api/product',
  '@/api/marketing',
  '@/api/lottery',
  '@/api/cms',
  '@/api/kefu',
  '@/api/crud',
  '@/components/mobileConfig',
  '@/components/uploadVideo',
  '@/pages/product',
  '@/pages/order',
  '@/pages/marketing'
]

const importPattern = /(?:from\s*|require\s*\(|import\s*\()\s*['"]([^'"]+)['"]/g
const extensions = ['.js', '.vue', '.json']
const missingImports = []

const resolves = (basePath) => {
  const candidates = [
    basePath,
    ...extensions.map((extension) => `${basePath}${extension}`),
    ...extensions.map((extension) => path.join(basePath, `index${extension}`))
  ]
  return candidates.some((candidate) => fs.existsSync(candidate))
}

for (const sourceFile of sourceFiles) {
  const original = fs.readFileSync(sourceFile, 'utf8')
  const source = original
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  for (const forbiddenImport of forbiddenImports) {
    if (source.includes(forbiddenImport)) {
      throw new Error(
        `Retired import remains in ${path.relative(adminSource, sourceFile)}: ${forbiddenImport}`
      )
    }
  }

  let match
  while ((match = importPattern.exec(source))) {
    const specifier = match[1]
    let basePath
    if (specifier.startsWith('@/')) {
      basePath = path.join(adminSource, specifier.slice(2))
    } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
      basePath = path.resolve(path.dirname(sourceFile), specifier)
    } else {
      continue
    }

    if (!resolves(basePath)) {
      missingImports.push(
        `${path.relative(adminSource, sourceFile)} -> ${specifier}`
      )
    }
  }
}

if (missingImports.length) {
  throw new Error(`Missing admin imports:\n${missingImports.join('\n')}`)
}

console.log(
  `admin retired-surface contract passed (source files: ${sourceFiles.length}, retired paths: ${retiredPaths.length})`
)
