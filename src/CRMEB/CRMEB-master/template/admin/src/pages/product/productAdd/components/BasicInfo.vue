<template>
  <!-- 基础信息 -->
  <el-row :gutter="24">
    <el-col :span="24">
      <el-form-item label="商品类型：">
        <div
          class="virtual"
          :class="formValidate.validity_type == item.id ? 'virtual_boder' : 'virtual_boder2'"
          v-for="(item, index) in validityOptions"
          :key="index"
          v-db-click
          @click="selectValidity(item.id)"
        >
          <div class="virtual_top">{{ item.tit }}</div>
          <div class="virtual_bottom">({{ item.tit2 }})</div>
          <div v-if="formValidate.validity_type == item.id" class="virtual_san"></div>
          <div v-if="formValidate.validity_type == item.id" class="virtual_dui">✓</div>
        </div>
      </el-form-item>
    </el-col>

    <el-col :span="24" v-if="formValidate.validity_type == 1">
      <el-form-item label="失效方式：">
        <el-radio-group v-model="formValidate.expire_mode">
          <el-radio :label="1">固定到期日（全场过期失效）</el-radio>
          <el-radio :label="2">购买后N天（按用户购买时间起算）</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-col>
    <el-col :span="24" v-if="formValidate.validity_type == 1 && formValidate.expire_mode == 1">
      <el-form-item label="到期日期：">
        <el-date-picker
          class="input_width"
          v-model="formValidate.valid_end_date"
          type="datetime"
          placeholder="选择到期日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
        <div class="tips-info">超过该时间后，全场该商品过期失效（可见但不可购买）</div>
      </el-form-item>
    </el-col>
    <el-col :span="24" v-if="formValidate.validity_type == 1 && formValidate.expire_mode == 2">
      <el-form-item label="有效天数：">
        <el-input-number class="input_width" v-model="formValidate.valid_days" :min="1" :step="1" />
        <span style="margin-left: 8px">天</span>
        <div class="tips-info">用户购买后 N 天内有效，按每个用户的购买时间分别起算</div>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label="类型名称：">
        <el-input
          class="input_width"
          v-model="formValidate.validity_name"
          placeholder="可选，留空使用默认名称"
          maxlength="64"
          show-word-limit
        />
        <div class="tips-info">自定义商品类型显示名称，留空则为「长期有效商品 / 有限期商品」</div>
      </el-form-item>
    </el-col>

    <el-col :span="24">
      <el-form-item label="商品名称：" prop="store_name">
        <el-input
          class="content_width"
          v-model="formValidate.store_name"
          placeholder="请输入商品名称"
          maxlength="80"
          show-word-limit
        />
      </el-form-item>
    </el-col>

    <el-col :span="24">
      <el-form-item label="单位：" prop="unit_name">
        <el-input
          class="input_width"
          v-model="formValidate.unit_name"
          placeholder="请输入单位"
          maxlength="5"
          show-word-limit
        />
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label="商品轮播图：" prop="slider_image">
        <div class="acea-row">
          <div
            class="pictrue"
            v-for="(item, index) in formValidate.slider_image"
            :key="index"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragover.prevent="handleDragOver($event, item)"
            @dragenter="handleDragEnter($event, item)"
            @dragend="handleDragEnd($event, item)"
          >
            <img v-lazy="item" />
            <i class="el-icon-error btndel" v-db-click @click="handleRemove(index)"></i>
          </div>
          <div
            v-if="formValidate.slider_image.length < 10"
            class="upLoad acea-row row-center-wrapper"
            v-db-click
            @click="modalPicTap('duo')"
          >
            <i class="el-icon-picture-outline" style="font-size: 24px"></i>
          </div>
          <el-input v-model="formValidate.slider_image[0]" style="display: none"></el-input>
        </div>

        <div class="tips-info">建议尺寸：800*800，可拖拽改变图片顺序，默认首张图为主图，最多上传10张</div>

        <!-- <div class="tips">(最多10张<br />750*750)</div> -->
      </el-form-item>
    </el-col>
    <el-col v-if="productExtrasEnabled || formValidate.video_link" :span="24" id="selectvideo">
      <el-form-item label="添加视频：" prop="video_link">
        <div v-if="productExtrasEnabled && !formValidate.video_link" class="videbox" @click="addVideo">
          <i class="el-icon-video-camera"></i>
        </div>
        <div class="box-video-style" v-if="formValidate.video_link">
          <video style="width: 100%; height: 100%" :src="formValidate.video_link" controls="controls">
            您的浏览器不支持 video 标签。
          </video>
          <div class="mark"></div>
          <i class="el-icon-delete iconv" v-db-click @click="delVideo"></i>
        </div>
        <Progress class="progress" :percent="progress" :stroke-width="5" v-if="upload.videoIng" />
        <div class="tips-info">建议时长：9～30秒，视频宽高比16:9</div>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label="商品分类：" prop="cate_id">
        <el-cascader
          class="content_width"
          v-model="formValidate.cate_id"
          filterable
          size="small"
          :options="treeSelect"
          :props="{ multiple: true, checkStrictly: true, emitPath: false }"
          clearable
        ></el-cascader>
        <span class="addfont" v-db-click @click="addCate">新增分类</span>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label="商品标签：">
        <div class="flex">
          <useLabel
            v-if="tileLabelList.length"
            :activeId.sync="formValidate.label_list"
            :listData="tileLabelList"
          ></useLabel>
          <el-button v-db-click @click="addGoodsTag">选择标签</el-button>
        </div>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label="商品状态：">
        <el-radio-group v-model="formValidate.is_show">
          <el-radio :label="1" class="radio">上架</el-radio>
          <el-radio :label="0">下架</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script>
import useLabel from '@/components/goodsLabel/useLabel';

export default {
  name: 'BasicInfo',
  components: {
    useLabel,
  },
  data() {
    return {
      // 商品仅保留两种有效期类型
      validityOptions: [
        { tit: '长期有效商品', id: 0, tit2: '永久有效' },
        { tit: '有限期商品', id: 1, tit2: '到期失效' },
      ],
    };
  },
  props: {
    formValidate: {
      type: Object,
      required: true,
    },
    goodsType: {
      type: Array,
      required: true,
    },
    treeSelect: {
      type: Array,
      required: true,
    },
    tileLabelList: {
      type: Array,
      required: true,
    },
    upload: {
      type: Object,
      required: true,
    },
    isCai: {
      type: Number | String,
      required: true,
    },
    productExtrasEnabled: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    selectValidity(id) {
      this.formValidate.validity_type = id;
      if (id === 0) {
        // 长期有效：清空有限期配置
        this.formValidate.expire_mode = 1;
        this.formValidate.valid_end_date = '';
        this.formValidate.valid_days = 30;
      }
    },
    virtualbtn(id, type) {
      this.$emit('virtualbtn', id, type);
    },
    handleDragStart(e, item) {
      this.$emit('handleDragStart', e, item);
    },
    handleDragOver(e, item) {
      this.$emit('handleDragOver', e, item);
    },
    handleDragEnter(e, item) {
      this.$emit('handleDragEnter', e, item);
    },
    handleDragEnd(e, item) {
      this.$emit('handleDragEnd', e, item);
    },
    handleRemove(index) {
      this.$emit('handleRemove', index);
    },
    modalPicTap(type) {
      this.$emit('modalPicTap', type);
    },
    addVideo() {
      this.$emit('addVideo');
    },
    delVideo() {
      this.$emit('delVideo');
    },
    addCate() {
      this.$emit('addCate');
    },
    addGoodsTag() {
      this.$emit('addGoodsTag');
    },
  },
};
</script>
<style lang="scss" scoped>
@use '../productAdd.scss' as *;
</style>
