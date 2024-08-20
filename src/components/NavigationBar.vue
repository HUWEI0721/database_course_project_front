<template>
    <nav class="navbar-main">
        <ul class="navbar-menu-main">
            <li class="navbar-item-main" v-for="(item, index) in menuItems" :key="index"
                :class="{ active: activeIndex === index }" @click="setActive(index)">
                <a href="#" class="navbar-link-main">{{ item }}</a>
            </li>
        </ul>
        <div class="underline"></div>
        <div class="active-line" :style="activeLineStyle"></div>
    </nav>
</template>

<script setup>
import { ref, computed } from 'vue';

// 定义导航栏菜单项
const menuItems = ref(['首页', '关于我们', '服务', '产品', '联系我们', 'what?']);
const activeIndex = ref(0);

// 更新当前活跃的导航项
const setActive = (index) => {
    activeIndex.value = index;
};

// 计算活跃线的位置和宽度
const activeLineStyle = computed(() => {
    return {
        transform: `translateX(${activeIndex.value * 100}%)`,
        width: `${100 / menuItems.value.length}%`
    };
});
</script>

<style scoped>
/* 导航栏的整体样式 */
.navbar-main {
    background-color: transparent;
    padding: 10px 20px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
    pointer-events: none;
    border-bottom: 1px solid #ccc;
    /* 底部下划线 */
}

/* 导航栏菜单项样式 */
.navbar-menu-main {
    list-style: none;
    display: flex;
    justify-content: space-between;
    /* 使用flex布局使菜单项均匀分布 */
    margin: 0;
    padding: 0;
    position: relative;
}

.navbar-item-main {
    flex: 1;
    /* 每个菜单项占据均等宽度 */
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    position: relative;
    cursor: pointer;
}

.navbar-link-main {
    color: black;
    text-decoration: none;
    font-size: 16px;
    transition: color 0.3s ease, transform 0.3s ease;
    pointer-events: auto;
}

/* 当前页面高亮 */
.navbar-item-main.active .navbar-link-main {
    color: #ff6347;
}

/* 鼠标悬停时的动态效果 */
.navbar-link-main:hover {
    color: #ff6347;
    transform: scale(1.1);
}

/* 活跃状态下方粗线 */
.active-line {
    position: absolute;
    bottom: -2px;
    left: 0;
    height: 4px;
    background-color: #ff6347;
    transition: transform 0.3s ease;
    pointer-events: none;
}

/* 下划线分隔导航栏和内容 */
.underline {
    height: 1px;
    background-color: #ccc;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    pointer-events: none;
}
</style>
