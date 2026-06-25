<template>
	<view :style="colorStyle">
		<goodsCate1 v-if="category == 1" ref="classOne" :isNew="isNew"></goodsCate1>
		<goodsCate2 v-if="category == 2" ref="classTwo" :isNew="isNew" @jumpIndex="jumpIndex"></goodsCate2>
		<goodsCate3 v-if="category == 3" ref="classThree" :isNew="isNew" @jumpIndex="jumpIndex"></goodsCate3>
		<pageFooter v-if="category == 1" @newDataStatus="newDataStatus" v-show="showBar"></pageFooter>
	</view>
</template>

<script>
	import colors from "@/mixins/color";
	import goodsCate1 from "./goods_cate1";
	import goodsCate2 from "./goods_cate2";
	import goodsCate3 from "./goods_cate3";
	import {
		mapGetters
	} from "vuex";
	import {
		getCategoryVersion
	} from "@/api/public.js";
	import pageFooter from "@/components/pageFooter/index.vue";
	import {
		isCoreScopeEnabled,
		TRAINING_CAMP_KEYWORD
	} from "@/config/coreScope.js";
	export default {
		computed: {
			...mapGetters(["isLogin", "uid"]),
			isCoreScope() {
				return isCoreScopeEnabled();
			}
		},
		components: {
			goodsCate1,
			goodsCate2,
			goodsCate3,
			pageFooter,
		},
		mixins: [colors],
		data() {
			return {
				category: "",
				status: 0,
				version: "",
				isNew: false,
				isFooter: false,
				showBar: false,
			};
		},
		onLoad() {
			if (this.isCoreScope) {
				uni.redirectTo({
					url: `/pages/goods/goods_list/index?searchValue=${TRAINING_CAMP_KEYWORD}&title=${TRAINING_CAMP_KEYWORD}`,
				});
			}
		},
		onReady() {},
		onShow() {
			if (this.isCoreScope) return;
			this.getCategoryVersion();
		},
		onPageScroll(e) {
			console.log(e)
			uni.$emit("scroll");
		},
		methods: {
			newDataStatus(val, num) {
				this.isFooter = val ? true : false;
				this.showBar = val ? true : false;
				this.pdHeight = num;
			},
			getCategoryVersion() {
				uni.$emit("uploadFooter");
				getCategoryVersion().then((res) => {
					if (
						!uni.getStorageSync("CAT_VERSION") ||
						res.data.version != uni.getStorageSync("CAT_VERSION")
					) {
						uni.setStorageSync("CAT_VERSION", res.data.version);
						uni.$emit("uploadCatData");
					}
					this.classStyle();
				});
			},
			jumpIndex() {
				uni.reLaunch({
					url: "/pages/index/index",
				});
			},
			classStyle() {
				this.category = 1;
				this.$nextTick(() => {
					if (this.$refs.classOne) this.$refs.classOne.getNav();
					uni.showTabBar();
				});
			},
		},
		onReachBottom: function() {
			if (this.category == 2) {
				this.$refs.classTwo.productslist();
			}
			if (this.category == 3) {
				this.$refs.classThree.productslist();
			}
		},
	};
</script>
<style scoped lang="scss">
	::v-deep.mask {
		z-index: 99;
	}

	::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
		display: none;
	}
</style>
