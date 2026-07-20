import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const userDaoPath = path.join(
  root,
  'src/CRMEB/CRMEB-master/crmeb/app/dao/user/UserDao.php'
)
const source = fs.readFileSync(userDaoPath, 'utf8')

assert.match(source, /->orderRaw\('MIN\(add_time\) asc'\)/)
assert.doesNotMatch(source, /->order\('MIN\(add_time\) asc'\)/)

console.log('user chart query contract checks passed')
