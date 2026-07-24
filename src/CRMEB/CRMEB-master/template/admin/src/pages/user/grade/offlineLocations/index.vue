<template>
  <div>
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form inline @submit.native.prevent>
          <el-form-item label="关键词：">
            <el-input
              v-model="query.keyword"
              clearable
              placeholder="名称/城市/地址/电话"
              @keyup.enter.native="search"
            />
          </el-form-item>
          <el-form-item label="小程序展示：">
            <el-select v-model="query.is_show" clearable placeholder="全部" style="width: 120px">
              <el-option label="展示" :value="1" />
              <el-option label="隐藏" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="search">查询</el-button>
            <el-button v-auth="['admin-user-offline-location-save']" type="success" @click="openEditor()">添加地址</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card :bordered="false" shadow="never" class="ivu-mt mt16">
      <el-table :data="list" v-loading="loading" size="small">
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="city" label="城市" width="90" />
        <el-table-column prop="address" label="详细地址" min-width="220" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column prop="businessHours" label="营业时间" min-width="150" />
        <el-table-column prop="status" label="状态文案" width="100" />
        <el-table-column prop="sort" label="排序" width="70" />
        <el-table-column label="展示" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isShow ? 'success' : 'info'">{{ scope.row.isShow ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="130">
          <template slot-scope="scope">
            <el-button v-auth="['admin-user-offline-location-save']" type="text" @click="openEditor(scope.row)">编辑</el-button>
            <el-button v-auth="['admin-user-offline-location-delete']" type="text" class="danger" @click="remove(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="page.page"
          :limit.sync="page.limit"
          @pagination="load"
        />
      </div>
    </el-card>

    <el-dialog :title="form.id ? '编辑线下地址' : '添加线下地址'" :visible.sync="visible" width="680px">
      <el-form ref="editor" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="城市" prop="city"><el-input v-model="form.city" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address"><el-input v-model="form.address" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="营业时间"><el-input v-model="form.business_hours" placeholder="如：周一至周日 09:00-18:00" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="服务内容"><el-input v-model="form.service" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="状态文案"><el-input v-model="form.status_text" placeholder="如：营业中" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" :max="9999" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="纬度"><el-input-number v-model="form.latitude" :precision="6" :step="0.000001" controls-position="right" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="经度"><el-input-number v-model="form.longitude" :precision="6" :step="0.000001" controls-position="right" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="小程序展示"><el-switch v-model="form.is_show" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { offlineLocationList, offlineLocationSave, offlineLocationDelete } from '@/api/user';

const emptyForm = () => ({
  id: 0,
  name: '',
  city: '',
  address: '',
  phone: '',
  business_hours: '',
  service: '',
  status_text: '营业中',
  latitude: 0,
  longitude: 0,
  sort: 0,
  is_show: 1,
});

export default {
  name: 'offlineLocations',
  data() {
    return {
      loading: false,
      saving: false,
      visible: false,
      list: [],
      total: 0,
      query: { keyword: '', is_show: '' },
      page: { page: 1, limit: 15 },
      form: emptyForm(),
      rules: {
        name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        city: [{ required: true, message: '请填写城市', trigger: 'blur' }],
        address: [{ required: true, message: '请填写详细地址', trigger: 'blur' }],
      },
    };
  },
  created() {
    this.load();
  },
  methods: {
    search() {
      this.page.page = 1;
      this.load();
    },
    load() {
      this.loading = true;
      offlineLocationList({ ...this.query, ...this.page })
        .then((res) => {
          this.list = res.data.list || [];
          this.total = res.data.count || 0;
        })
        .catch((error) => this.$message.error(error.msg || '线下地址加载失败'))
        .finally(() => {
          this.loading = false;
        });
    },
    openEditor(row) {
      this.form = row
        ? {
            id: row.id,
            name: row.name,
            city: row.city,
            address: row.address,
            phone: row.phone,
            business_hours: row.businessHours,
            service: row.service,
            status_text: row.status,
            latitude: Number(row.latitude || 0),
            longitude: Number(row.longitude || 0),
            sort: Number(row.sort || 0),
            is_show: Number(row.isShow || 0),
          }
        : emptyForm();
      this.visible = true;
      this.$nextTick(() => this.$refs.editor && this.$refs.editor.clearValidate());
    },
    save() {
      this.$refs.editor.validate((valid) => {
        if (!valid) return;
        this.saving = true;
        offlineLocationSave(this.form.id, this.form)
          .then((res) => {
            this.$message.success(res.msg || '保存成功');
            this.visible = false;
            this.load();
          })
          .catch((error) => this.$message.error(error.msg || '保存失败'))
          .finally(() => {
            this.saving = false;
          });
      });
    },
    remove(row) {
      this.$confirm(`确认删除“${row.name}”？`, '删除线下地址', { type: 'warning' })
        .then(() => offlineLocationDelete(row.id))
        .then((res) => {
          this.$message.success(res.msg || '删除成功');
          this.load();
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') this.$message.error(error.msg || '删除失败');
        });
    },
  },
};
</script>

<style scoped>
.danger {
  color: #f56c6c;
}
</style>
