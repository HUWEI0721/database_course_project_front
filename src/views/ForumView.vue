<template>
    <NavigationBar />
    <div class="forum-bg">
        <div class="forum-container">
            <!-- 帖子卡片 -->
            <el-card class="card">
                <!-- 站内公告 -->
                <div class="announcement-section">
                    <el-row class="row">
                        <el-col :span="4">
                            <icon-home />
                        </el-col>
                        <el-col :span="20">
                            <el-text class="title">站内公告</el-text>
                        </el-col>
                    </el-row>
                    <div class="announcement-content">
                        <el-divider />
                        <el-text>📢 全新打卡活动上线！快来参与，每日打卡赢取丰厚奖励！<br />🎉 社区迎来全新升级，更多精彩功能等你体验！</el-text>
                        <el-divider />
                    </div>
                </div>

                <el-divider />

                <!-- 打卡活动 -->
                <div class="activity-section">
                    <el-row class="row">
                        <el-col :span="4">
                            <icon-calendar />
                        </el-col>
                        <el-col :span="20">
                            <el-text class="title">打卡活动</el-text>
                        </el-col>
                    </el-row>
                    <div class="activity-content">
                        <el-divider />
                        <el-text>💪 健身达人7天打卡挑战赛：完成7天连续打卡，赢取健身礼包！<br />🏃
                            每日晨跑打卡：坚持跑步，每日签到赢取健康积分！</el-text>
                        <el-divider />
                    </div>
                </div>

                <el-divider />

                <!-- 比赛活动通知 -->
                <div class="contest-section">
                    <el-row class="row">
                        <el-col :span="4">
                            <icon-trophy />
                        </el-col>
                        <el-col :span="20">
                            <el-text class="title">比赛活动</el-text>
                        </el-col>
                    </el-row>
                    <div class="contest-content">
                        <el-divider />
                        <el-text>🏅 社区健身大赛：参与比赛，展现你的健身成果，赢取丰厚奖品！<br />🏆 全年健身挑战赛：累计积分最高者将赢得终极大奖！</el-text>
                        <el-divider />
                    </div>
                </div>
            </el-card>

            <div class="main-content">
                <!-- 导航栏部分 -->
                <nav class="navbar">
                    <ul class="navbar-list">
                        <li class="navbar-item" v-for="category in visibleCategories" :key="category"
                            @click="filterByCategory(category)" :class="{ active: selectedCategory === category }">
                            {{ category }}
                            <span class="underline" v-if="selectedCategory === category"></span>
                        </li>
                    </ul>
                    <!-- 右箭头按钮 -->
                    <button class="scroll-btn" @click="scrollRight">
                        <icon-arrow-right />
                    </button>
                </nav>
                <EditArticle v-model:title="newPost.postTitle" v-model:content="newPost.postContent"
                    v-model:category="newPost.postCategory" @add-post="addPost" />

                <!-- 帖子列表部分 -->
                <div v-for="post in filteredPosts" :key="post.postID" class="post-item">
                    <div class="post-content">
                        <h3 class="post-title" @click="viewPost(post.postID)">{{ post.postTitle }}</h3>
                        <p class="post-snippet">{{ post.postContent }}</p>
                    </div>
                    <div class="post-footer">
                        <span class="post-author">{{ post.userID }}</span>
                        <span class="post-actions">
                            <icon-thumb-up @click="toggleLike(post.postID)" class="icon-with-text">
                                <span>{{ post.liked ? '取消' : '点赞' }} {{ post.likesCount }}</span>
                            </icon-thumb-up>
                            <icon-message @click="viewComments(post.postID)" class="icon-with-text">
                                <span>{{ getCommentCount(post.postID) }}</span>
                            </icon-message>
                            <icon-eye class="icon-with-text">
                                <span>{{ post.views }}</span>
                            </icon-eye>
                        </span>
                    </div>
                </div>
            </div>

            <!-- 右侧栏：热帖展示区域 -->
            <div class="right-sidebar">
                <div class="hot-posts-section">
                    <el-row class="row">
                        <el-col :span="4">
                            <icon-fire />
                        </el-col>
                        <el-col :span="20">
                            <el-text class="title">热帖推荐</el-text>
                        </el-col>
                    </el-row>
                    <div class="hot-posts-content">
                        <el-divider />
                        <el-text v-for="hotPost in hotPosts" :key="hotPost.postID" @click="viewPost(hotPost.postID)"
                            class="hot-post-title">
                            <icon-fire class="icon-fire-small" /> {{ hotPost.postTitle }}
                        </el-text>
                        <el-divider />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import NavigationBar from '@/components/NavigationBar.vue';
import EditArticle from '@/components/EditArticle.vue';
import { IconThumbUp, IconMessage, IconEye, IconDelete, IconCalendar, IconTrophy, IconArrowRight, IconFire, IconHome } from '@arco-design/web-vue/es/icon';

export default {

    components: {
        NavigationBar,
        EditArticle,
        IconHome,
        IconThumbUp,
        IconMessage,
        IconEye,
        IconDelete,
        IconCalendar,
        IconTrophy,
        IconArrowRight,
        IconFire
    },
    data() {
        return {
            newPost: {
                postTitle: '',
                postContent: '',
                postCategory: '',
            },
            allPosts: [], // 将初始数据移除，依赖fetchAllPosts填充
            filteredPosts: [],
            hotPosts: [],  // 热帖数组
            selectedCategory: "全部帖子", // 初始选中的类别
            currentIndex: 0,
        };
    },
    computed: {
        ...mapState(["categories"]),
        visibleCategories() {
            // 连接数组形成循环效果
            const doubledCategories = [...this.categories, ...this.categories];
            const startIndex = this.currentIndex % this.categories.length;
            return doubledCategories.slice(startIndex, startIndex + 6); // 假设一次显示6个项目
        },
    },
    created() {
        // 在组件创建时初始化所有帖子，并确保展示全部帖子
        this.fetchAllPosts();
    },
    methods: {
        scrollRight() {
            this.currentIndex = (this.currentIndex + 1) % this.categories.length;
        },

        /**
         * 获取所有帖子，并更新allPosts和filteredPosts以便展示
         */
        getAllPosts(token) {
            return axios.get('http://localhost:8080/api/Post/GetAllPost', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    console.log("收到的帖子数据:", response.data);
                    this.allPosts = response.data; // 将获取到的帖子存储到allPosts数组中
                    this.filteredPosts = this.allPosts; // 初始展示所有帖子
                    this.updateHotPosts(); // 更新热帖
                    return response; // 返回响应，以便其他方法继续使用
                })
                .catch(error => {
                    console.error('获取所有帖子时发生错误:', error);
                    throw error; // 抛出错误，以便在调用方处理
                });
        },

        /**
         * 初始化获取所有帖子
         */
        fetchAllPosts() {
            const token = this.$store.state.token; // 从 Vuex 获取 token
            this.getAllPosts(token)
                .then(response => {
                    this.filteredPosts = this.allPosts; // 确保初始展示所有帖子
                    this.updateHotPosts(); // 确保初始展示热帖
                })
                .catch(error => {
                    console.error('获取帖子时发生错误:', error);
                });
        },

        /**
         * 更新热帖数组，按浏览量排序并取前10个
         */
        updateHotPosts() {
            this.hotPosts = this.allPosts
                .slice()
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);
        },

        /**
         * 根据所选分类筛选帖子，并更新filteredPosts
         */
        filterByCategory(category) {
            this.selectedCategory = category;
            if (category === "全部帖子") {
                this.filteredPosts = this.allPosts;
            } else {
                this.filteredPosts = this.allPosts.filter(post => post.postCategory === category);
            }
            this.updateHotPosts(); // 更新热帖
        },

        /**
         * 获取评论数并返回，该操作不会改变filteredPosts内容
         */
        getCommentCount(postId) {
            const token = this.$store.state.token; // 从 Vuex 获取 token
            return axios.get('http://localhost:8080/api/Comment/GetCommentByPostID', {
                params: { postID: postId },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    console.log("收到的评论数据:", response.data);
                    const comments = response.data;
                    const countComments = (comments) => {
                        return comments.reduce((acc, comment) => {
                            return acc + 1 + countComments(comment.replies);
                        }, 0);
                    };
                    return countComments(comments);
                })
                .catch(error => {
                    console.error('获取评论时发生错误:', error);
                    return 0;
                });
        },

        /**
         * 查看帖子详情
         */
        viewPost(postId) {
            this.$router.push({ name: 'PostDetail', params: { id: postId } });
        },

        /**
         * 点赞或取消点赞操作，并更新allPosts和filteredPosts中对应帖子的点赞数
         */
        toggleLike(postId) {
            const token = this.$store.state.token; // 从 Vuex 获取 token
            const post = this.allPosts.find(p => p.postID === postId);
            console.log(post.likesCount);
            if (post) {
                if (post.liked) {
                    axios.delete('http://localhost:8080/api/PostContoller/CancleLikePost', {
                        params: { postID: postId },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                        .then(() => {
                            post.likesCount -= 1;
                            post.liked = false;
                            this.updateHotPosts(); // 更新热帖
                        })
                        .catch(error => {
                            console.error('取消点赞时发生错误:', error);
                        });
                } else {
                    axios.post('http://localhost:8080/api/Post/likePost', null, {
                        params: { postID: postId },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                        .then(() => {
                            post.likesCount += 1;
                            post.liked = true;
                            this.updateHotPosts(); // 更新热帖
                        })
                        .catch(error => {
                            console.error('点赞时发生错误:', error);
                        });
                }
            }
        },

        /**
         * 发布新帖子，并更新allPosts和filteredPosts
         */
        addPost() {
            const token = this.$store.state.token; // 从 Vuex 获取 token
            if (this.newPost.postTitle && this.newPost.postContent && this.newPost.postCategory) {
                const newPost = {
                    postID: -1,
                    userID: -1,
                    postTitle: this.newPost.postTitle,
                    postContent: this.newPost.postContent,
                    postCategory: this.newPost.postCategory,
                    postTime: new Date().toISOString(),
                    likesCount: 0,
                    forwardCount: 0,
                    commentsCount: 0,
                    refrencePostID: -1,
                };
                console.log("发布的帖子数据:", newPost);
                axios.post('http://localhost:8080/api/Post/PublishPost', newPost, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(response => {
                        console.log("发布帖子成功:", response.data.message);
                        this.allPosts.push(newPost);
                        this.filteredPosts.push(newPost); // 同时更新 filteredPosts
                        this.updateHotPosts(); // 更新热帖
                        this.resetNewPostForm();
                    })
                    .catch(error => {
                        console.error('发布帖子时发生错误:', error);
                    });
            } else {
                alert('请填写所有字段！');
            }
        },

        resetNewPostForm() {
            this.newPost = {
                postTitle: '',
                postContent: '',
                postCategory: '',
            };
            // 重新触发绑定，更新 EditArticle 中的表单内容
            this.$forceUpdate(); // 强制 Vue 更新，确保数据同步
        }
    },

    /**
     * 删除帖子，并更新allPosts和filteredPosts
     */
    deletePost(postId) {
        const token = this.$store.state.token; // 从 Vuex 获取 token
        axios.delete('http://localhost:8080/api/Post/DeletePostByPostID', {
            params: { postID: postId },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log(response.data.message);
                this.allPosts = this.allPosts.filter(post => post.postID !== postId);
                this.filteredPosts = this.filteredPosts.filter(post => post.postID !== postId);
                this.updateHotPosts(); // 更新热帖
            })
            .catch(error => {
                console.error('删除帖子时发生错误:', error);
            });
    },
};
</script>

<style scoped>
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}

.forum-bg {
    background-image: url('../components/icons/forum-bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    width: 100%;
    min-height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
}

/* 导航栏样式 */
.navbar {
    margin-top: 60px;
    background: transparent;
    padding: 10px 0;
    position: absolute;
    width: 830px;
    z-index: 100;
    top: 0;
    transition: background-color 0.3s ease;
    border-bottom: 2px solid #ccc;
    /* 添加下方的横线 */
    display: flex;
    justify-content: space-between;
    /* 保证列表和按钮分布均匀 */
    align-items: center;
}

.navbar-list {
    list-style: none;
    display: flex;
    gap: 30px;
    margin: 0;
    padding: 0;
    align-items: center;
}

.navbar-item {
    width: 105px;
    position: relative;
    color: black;
    cursor: pointer;
    padding: 0 0;
    transition: color 0.3s ease, transform 0.3s ease;
    text-align: center;
    font-size: 16px;
}

.navbar-item::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 2px;
    background-color: #2575fc;
    transition: width 0.3s ease;
}

.navbar-item:hover {
    font-weight: bold;
    color: blue;
    transform: scale(1.1);
}

.navbar-item:hover::after {
    width: 100%;
}

.navbar-item.active {
    font-weight: bold;
    color: blue;
}

.navbar-item.active::after {
    width: 100%;
    background-color: blue;
}

.scroll-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: background-color 0.3s ease;
}

.scroll-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.forum-container {
    display: flex;
    justify-content: space-between;
    padding-top: 60px;
    padding-right: 50px;
    max-width: 100%;
    margin: 80px auto 0;
    /* 在顶部留出导航栏的空间 */
    overflow: auto;
}


.card {
    margin-left: 5px;
    width: 400px;
    background-color: transparent;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    margin-bottom: 10px;
}

.title {
    font-size: 14px;
    font-weight: bolder;
    color: #000;
    padding-left: 8px;
}

.text {
    font-size: 14px;
    color: #000;
    padding-left: 16px;
}

.tagLine {
    margin-left: 16px;
    margin-bottom: 10px;
}

.tag {
    margin-right: 5px;
    margin-bottom: 5px;
}

.row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20px;
}

.main-content {
    width: 1200px;
    padding-left: 60px;
    padding-right: 0;
}

.post-item {
    background-color: #fff;
    color: #000;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 2px solid #ddd;
}

.post-content {
    text-align: left;
}

.post-title {
    font-size: 18px;
    color: #007bff;
    margin-bottom: 10px;
    cursor: pointer;
}

.post-snippet {
    font-size: 16px;
    color: #666;
}

.post-footer {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #888;
}

.post-author {
    font-weight: bold;
}

.post-actions {
    display: flex;
    gap: 40px;
    /* 添加间距 */
    align-items: center;
}

.icon-with-text {
    color: black;
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 5px;
    /* 图标和文本之间的距离 */
}

.icon-with-text:hover {
    color: #007bff;
    /* 鼠标悬停时改变颜色 */
}

.icon-fire-small {
    font-size: 16px;
    /* 小火焰图标的尺寸 */
    margin-right: 8px;
}

.right-sidebar {
    margin-right: 5px;
    margin-left: 20px;
    width: 400px;
    background-color: transparent;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    margin-bottom: 10px;
    width: 25%;
    padding-left: 0;
    display: flex;
    flex-direction: column;
    align-items: left;
}

.hot-posts-section {
    margin-top: 30px;
}

.hot-posts-content {
    padding-left: 16px;
    padding-right: 16px;
}

.hot-post-title {
    font-size: 14px;
    color: #007bff;
    cursor: pointer;
    display: block;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}

.hot-post-title:hover {
    text-decoration: underline;
}
</style>
