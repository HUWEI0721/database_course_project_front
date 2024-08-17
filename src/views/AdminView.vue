<template>
    <div class="background">
        <div class="common-layout">
            <el-container>
                <el-header>
                    <img src="../assets/logo.png" alt="FitFit" class="logo" />
                    <span>FitFit</span>
                    <div class="user">
                        <el-dropdown>
                            <img src="../assets/user.jpeg" alt="User" class="dropdownlink" />
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="goPage('/home')">
                                        <el-icon>
                                            <House />
                                        </el-icon>
                                        首页
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="openUser">
                                        <el-icon>
                                            <UserFilled />
                                        </el-icon>
                                        个人资料
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-icon>
                                            <Setting />
                                        </el-icon>
                                        账号设置
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <el-icon>
                                            <Switch />
                                        </el-icon>
                                        切换账号
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="goPage('/')">
                                        <el-icon>
                                            <SwitchButton />
                                        </el-icon>
                                        退出
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </el-header>
                <el-container>
                    <el-aside width="200px">
                        <el-menu default-active="1" class="el-menu-vertical-demo" @open="handleOpen"
                            @close="handleClose">
                            <el-menu-item index="1" @click="active = 1">
                                <el-icon><icon-menu /></el-icon>
                                <span>用户管理</span>
                            </el-menu-item>
                            <el-menu-item index="2" @click="active = 2">
                                <el-icon>
                                    <setting />
                                </el-icon>
                                <span>内容管理</span>
                            </el-menu-item>
                        </el-menu>
                    </el-aside>
                    <el-main>
                        <div v-if="active == 1">
                            <el-table :data="users" style="width: 100%">
                                <el-table-column prop="username" label="用户名"></el-table-column>
                                <el-table-column prop="email" label="邮箱"></el-table-column>
                                <el-table-column prop="registrationDate" label="注册日期">
                                    <template #default="{ row }">
                                        {{ formatDate(row.registrationDate) }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="activityCount" label="活动记录数">
                                    <template #default="{ row }">
                                        <el-tag type="success">{{ row.activityCount }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column fixed="right" label="操作" width="250">
                                    <template #default="{ row }">
                                        <el-button size="small" type="danger"
                                            @click="restrictUser(row)">限制言论</el-button>
                                        <el-button size="small" type="warning"
                                            @click="deactivateUser(row)">注销账户</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <div v-if="active == 2">
                            <el-table :data="contentList" style="width: 100%">
                                <el-table-column prop="title" label="标题"></el-table-column>
                                <el-table-column prop="author" label="作者"></el-table-column>
                                <el-table-column prop="type" label="类型">
                                    <template #default="{ row }">
                                        <el-tag :type="row.type === 'post' ? 'info' : 'warning'">{{ row.type === 'post'
                                            ?
                                            '帖子' : '评论' }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="status" label="状态">
                                    <template #default="{ row }">
                                        <el-tag :type="row.status === 'active' ? 'success' : 'danger'">{{ row.status
                                            }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="date" label="发布时间">
                                    <template #default="{ row }">
                                        {{ formatDate(row.date) }}
                                    </template>
                                </el-table-column>
                                <el-table-column fixed="right" label="操作" width="300">
                                    <template #default="{ row }">
                                        <el-button size="small" type="danger" @click="deleteContent(row)">删除</el-button>
                                        <el-button size="small" @click="getComments(row)">查看评论</el-button>
                                        <el-button v-if="row.type === 'post'" size="small" type="warning"
                                            @click="mergePosts(row)">合并</el-button>
                                        <el-button v-if="row.type === 'post'" size="small" type="primary"
                                            @click="flagPost(row)">标注</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>

                            <el-dialog v-model="dialogVisible" :title="article.title" width="500"
                                :before-close="handleClose">
                                <span>{{ article.content }}</span>
                                <template #footer>
                                    <div class="dialog-footer">
                                        <el-button @click="dialogVisible = false">取消</el-button>
                                        <el-button type="primary" @click="">确认</el-button>
                                    </div>
                                </template>
                            </el-dialog>
                        </div>
                    </el-main>
                </el-container>
            </el-container>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from "vue-router";

import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
} from "@element-plus/icons-vue";

const router = useRouter();
let active = ref(1);
let dialogVisible = ref(false);
let article = ref({
    content: '',
    title: ''
});

// 用户管理示例数据
const users = ref([
    {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        registrationDate: new Date(),
        activityCount: 10,
    },
    {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        registrationDate: new Date(),
        activityCount: 5,
    },
]);

// 内容管理示例数据
const contentList = ref([
    {
        id: 1,
        title: '帖子标题1',
        author: 'user1',
        date: new Date(),
        type: 'post',
        status: 'active',
    },
    {
        id: 2,
        title: '帖子标题2',
        author: 'user2',
        date: new Date(),
        type: 'post',
        status: 'inactive',
    },
    {
        id: 3,
        title: '评论内容1',
        author: 'user3',
        date: new Date(),
        type: 'comment',
        status: 'active',
    },
]);

// 格式化日期
function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// 用户管理操作
function restrictUser(user) {
    console.log(`限制用户 ${user.username} 的言论`);
}

function deactivateUser(user) {
    console.log(`注销用户 ${user.username} 的账户`);
}

// 内容管理操作
function getComments(row) {
    dialogVisible.value = true;
    article.value.content = row.author;
    article.value.title = row.title;
}

function deleteContent(content) {
    console.log(`删除内容: ${content.title}`);
}

function mergePosts(post) {
    console.log(`合并帖子: ${post.title}`);
}

function flagPost(post) {
    console.log(`标注帖子: ${post.title}`);
}

// 导航操作
const handleOpen = (key, keyPath) => {
    console.log(key, keyPath);
};

const handleClose = (key, keyPath) => {
    console.log(key, keyPath);
};

const openUser = () => {
    router.push({
        path: "/Profile",
    });
};

const goPage = (path) => {
    router.push({
        path,
    });
};
</script>

<style>
#app {
    max-width: 100% !important;
    margin: 0;
    padding: 0;
}

.background {
    background-image: url('../components/icons/forum-bg.jpg');
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
}

.el-container,
.el-menu {
    height: 90vh;
    margin: 0;
    padding: 0;
}

.el-header {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-shadow: 2px 2px 2px #ccc;
}

.el-header span {
    font-size: 24px;
    margin-left: 10px;
    font-weight: 700;
}

.logo {
    width: 60px;
    /* 调整logo尺寸 */
    height: auto;
}

.dropdownlink {
    width: 40px;
    /* 调整用户头像尺寸 */
    height: 40px;
    border-radius: 50%;
}

.user {
    position: absolute;
    right: 2%;
}

.el-scrollbar__view {
    display: block !important;
}
</style>
