<template>
  <div class="expand">
    <el-row class="expand-row">
      <el-col :span="6">
        <span class="expand-key">Total price:</span>
        <span class="expand-value" v-text="row.total_price"></span>
      </el-col>
      <el-col :span="6">
        <span class="expand-key">Order time:</span>
        <span class="expand-value" v-text="row.add_time"></span>
      </el-col>
      <el-col :span="6">
        <span class="expand-key">Promoter:</span>
        <span class="expand-value" v-text="row.spread_nickname ? row.spread_nickname : 'None'"></span>
      </el-col>
      <el-col :span="6">
        <span class="expand-key">Division:</span>
        <span class="expand-value" v-text="row.division_name ? row.division_name : 'None'"></span>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <span class="expand-key">User note:</span>
        <span class="expand-value" v-text="row.mark ? row.mark : 'None'"></span>
      </el-col>
      <el-col :span="6">
        <span class="expand-key">Merchant note:</span>
        <span class="expand-value" v-text="row.remark ? row.remark : 'None'"></span>
      </el-col>
      <el-col :span="6" v-if="isStorePickupAvailable() && row.shipping_type == 2">
        <span class="expand-key">Write-off store:</span>
        <span class="expand-value" v-text="row.verify_code ? row.store_name : 'None'"></span>
      </el-col>
      <el-col :span="6" v-if="isStorePickupAvailable() && row.shipping_type == 2">
        <span class="expand-key">Write-off code:</span>
        <span class="expand-value" v-text="row.verify_code ? row.verify_code : 'None'"></span>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { isStorePickupAvailable } from '@/config/coreScope';

export default {
  name: 'table-expand',
  props: {
    row: Object,
  },
  methods: {
    isStorePickupAvailable,
  },
};
</script>

<style scoped>
.expand {
  /* padding-left: 50px; */
}
.expand-row {
  margin-bottom: 16px;
}
</style>