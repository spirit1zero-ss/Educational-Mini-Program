import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const userList = read('src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/index.vue')
const userEdit = read('src/CRMEB/CRMEB-master/template/admin/src/pages/user/list/handle/userEditForm.vue')
const agentPage = read('src/CRMEB/CRMEB-master/template/admin/src/pages/agent/agentManage.vue')
const agentServices = read('src/CRMEB/CRMEB-master/crmeb/app/services/agent/AgentManageServices.php')
const distributionServices = read('src/CRMEB/CRMEB-master/crmeb/app/services/user/DistributionServices.php')
const userController = read('src/CRMEB/CRMEB-master/crmeb/app/adminapi/controller/v1/user/User.php')
const userServices = read('src/CRMEB/CRMEB-master/crmeb/app/services/user/UserServices.php')
const identityDialog = read('src/CRMEB/CRMEB-master/template/admin/src/components/distribution/identityDialog.vue')

assert.match(userEdit, /v-model="formItem\.agent_level"/)
assert.doesNotMatch(userEdit, /label="用户等级："/)
assert.match(userList, /设置分销身份/)
assert.match(userList, /退款会员处理/)
assert.doesNotMatch(userList, /<el-dropdown-item command="2">修改余额/)
assert.doesNotMatch(userList, /<el-dropdown-item command="8">修改积分/)
assert.doesNotMatch(userList, /<el-dropdown-item command="3">赠送会员/)

assert.match(agentPage, /训练营分销员管理/)
assert.match(agentPage, /固定返佣模式/)
assert.match(agentPage, /待审核佣金/)
assert.match(agentPage, /冻结推广资格/)
assert.doesNotMatch(agentPage, /推广二维码/)
assert.doesNotMatch(agentPage, /修改分销等级/)

assert.match(agentServices, /adminAgentPage\(\$where\)/)
assert.match(agentServices, /adminAgentSummary\(\$where\)/)
assert.match(distributionServices, /miniapp_training_camp_order/)
assert.match(distributionServices, /MEMBER_INCOME_TYPES/)
assert.match(distributionServices, /public function adminAgentPage/)
assert.match(distributionServices, /public function adminAgentSummary/)
assert.match(userController, /\['agent_level', \(int\)\$currentUser->getData\('agent_level'\)\]/)
assert.match(identityDialog, /distribution_only: 'identity'/)
assert.match(agentPage, /distribution_only: 'promotion'/)
assert.match(userController, /\$distributionOnly === 'identity'/)
assert.match(userController, /\$distributionOnly === 'promotion'/)
assert.match(userServices, /function updateDistributionIdentity/)
assert.match(userServices, /function updatePromotionQualification/)

console.log('admin training-camp agent workspace contract passed')
