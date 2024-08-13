<template>
    <div class="forum-bg">
        <NavigationBar />
        <div class="forum-container">
            <!-- 发帖弹窗 -->
            <div v-if="showNewPostForm" class="new-post-modal">
                <div class="new-post-content">
                    <h2>创建新帖子</h2>
                    <input v-model="newPost.title" type="text" placeholder="帖子标题" class="input-title" />
                    <textarea v-model="newPost.content" placeholder="分享你的想法..." class="input-content"></textarea>
                    <input type="file" @change="handleFileUpload" multiple class="upload-input" />
                    <select v-model="newPost.category" class="select-category">
                        <option value="" disabled>选择类别</option>
                        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                    </select>
                    <button @click="addPost" class="btn btn-primary">发布帖子</button>
                    <button @click="showNewPostForm = false" class="btn btn-secondary">取消</button>
                </div>
            </div>

            <!-- 左侧分类栏 -->
            <div class="category-sidebar">
                <div v-for="category in categories" :key="category" class="category-item"
                    @click="filterByCategory(category)">
                    {{ category }}
                </div>
            </div>

            <!-- 主内容区域 -->
            <div class="main-content">
                <div v-for="post in filteredPosts" :key="post.id" class="post-item">
                    <div class="post-content">
                        <h3 class="post-title" @click="viewPost(post.id)">{{ post.title }}</h3>
                        <p class="post-snippet">{{ post.snippet }}</p>
                    </div>
                    <div class="post-footer">
                        <span class="post-author">{{ post.author }}</span>
                        <span class="post-actions">
                            <span @click="toggleLike(post.id)">
                                👍 {{ post.liked ? '取消' : '点赞' }} {{ post.likes }}
                            </span>
                            <span @click="viewComments(post.id)">💬 {{ getCommentCount(post.id) }}</span>
                            <span>👁️ {{ post.views }}</span>
                            <!-- 只有自己发的帖子才显示删除按钮 -->
                            <button v-if="isOwnPost(post)" @click="deletePost(post.id)"
                                class="btn btn-danger">删除</button>
                        </span>
                    </div>
                </div>
            </div>

            <!-- 右侧栏 -->
            <div class="right-sidebar">
                <div class="hot-posts">
                    <div v-for="hotPost in hotPosts" :key="hotPost.id" class="hot-post-item"
                        @click="viewPost(hotPost.id)">
                        {{ hotPost.title }}
                    </div>
                </div>
                <button class="create-post-btn" @click="showNewPostForm = true">发布帖子</button>
            </div>
        </div>
    </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue';
import { mapState } from 'vuex';
import {
    publishPost,
    getAllPosts,
    likePost,
    cancelLikePost,
    getCommentsByPostID,
    publishComment,
    replyComment,
    deletePostByPostID,
    deleteComment,
    likeComment,
    cancelLikeComment,
} from '@/api/forum_api.js';

export default {
    components: { NavigationBar },
    data() {
        return {
            showNewPostForm: false,
            newPost: {
                title: '',
                content: '',
                category: '',
                media: null,
            },
            categories: ["全部帖子", "帖子类别1", "帖子类别2", "帖子类别3", "帖子类别4", "帖子类别5"],
            filteredPosts: [],
        };
    },
    computed: {
        ...mapState(["posts"]),
        ...mapState(["hotPosts"]),
        ...mapState(["relatedPosts"]),
    },
    created() {
        this.fetchAllPosts();
    },
    methods: {
        fetchAllPosts() {
            getAllPosts()
                .then(response => {
                    this.posts = response.data;
                    this.filteredPosts = this.posts;
                })
                .catch(error => {
                    console.error('Error fetching posts:', error);
                });
        },
        filterByCategory(category) {
            if (category === "全部帖子") {
                this.filteredPosts = this.posts;
            } else {
                this.filteredPosts = this.posts.filter(post => post.category === category);
            }
        },
        getCommentCount(postId) {
            return getCommentsByPostID(postId)
                .then(response => {
                    const comments = response.data;
                    const countComments = (comments) => {
                        return comments.reduce((acc, comment) => {
                            return acc + 1 + countComments(comment.replies);
                        }, 0);
                    };
                    return countComments(comments);
                })
                .catch(error => {
                    console.error('Error fetching comments:', error);
                    return 0;
                });
        },
        viewPost(postId) {
            this.$router.push({ name: 'PostDetail', params: { id: postId } });
        },
        toggleLike(postId) {
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                if (post.liked) {
                    cancelLikePost(postId).then(() => {
                        post.likes -= 1;
                        post.liked = false;
                    }).catch(error => {
                        console.error('Error canceling like:', error);
                    });
                } else {
                    likePost(postId).then(() => {
                        post.likes += 1;
                        post.liked = true;
                    }).catch(error => {
                        console.error('Error liking post:', error);
                    });
                }
            }
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.newPost.media = {
                        type: file.type.startsWith("image") ? "image" : "video",
                        src: e.target.result,
                    };
                };
                reader.readAsDataURL(file);
            }
        },
        addPost() {
            if (this.newPost.title && this.newPost.content && this.newPost.category) {
                const newPost = {
                    postTitle: this.newPost.title,
                    postContent: this.newPost.content,
                    postCategory: this.newPost.category,
                    userId: this.$store.state.userId, // 假设 userId 在 Vuex 中
                    postTime: new Date().toISOString(),
                };
                publishPost(newPost)
                    .then(response => {
                        this.posts.push(response.data);
                        this.filteredPosts = this.posts;
                        this.resetNewPostForm();
                    })
                    .catch(error => {
                        console.error('Error publishing post:', error);
                    });
            } else {
                alert('请填写所有字段！');
            }
        },
        resetNewPostForm() {
            this.newPost = {
                title: '',
                content: '',
                category: '',
                media: null,
            };
            this.showNewPostForm = false;
        },
        deletePost(postId) {
            const role = this.$store.state.role; // 假设角色信息在 Vuex 中
            deletePostByPostID(postId, role)
                .then(() => {
                    this.posts = this.posts.filter(post => post.id !== postId);
                    this.filteredPosts = this.filteredPosts.filter(post => post.id !== postId);
                })
                .catch(error => {
                    console.error('Error deleting post:', error);
                });
        },
        isOwnPost(post) {
            return post.authorId === this.$store.state.userId; // 假设 authorId 在 post 对象中
        },
        addComment(postId, commentContent) {
            const comment = {
                postID: postId,
                userID: this.$store.state.userId, // 假设 userId 在 Vuex 中
                content: commentContent,
                commentTime: new Date().toISOString(),
            };
            publishComment(comment)
                .then(response => {
                    const post = this.posts.find(p => p.id === postId);
                    post.comments.push(response.data);
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
                });
        },

        viewComments(postId) {
            this.$router.push({ name: 'PostDetail', params: { id: postId } });
        },

        replyToComment(commentID, replyContent) {
            const reply = {
                commentID: commentID,
                userID: this.$store.state.userId, // 假设 userId 在 Vuex 中
                content: replyContent,
                commentTime: new Date().toISOString(),
            };
            replyComment(reply)
                .then(response => {
                    const post = this.posts.find(p => p.comments.some(c => c.id === commentID));
                    const comment = post.comments.find(c => c.id === commentID);
                    comment.replies.push(response.data);
                })
                .catch(error => {
                    console.error('Error replying to comment:', error);
                });
        },
        deleteComment(commentID) {
            deleteComment(commentID)
                .then(() => {
                    this.posts.forEach(post => {
                        post.comments = post.comments.filter(comment => comment.id !== commentID);
                    });
                })
                .catch(error => {
                    console.error('Error deleting comment:', error);
                });
        },
        toggleLikeComment(commentID) {
            const comment = this.posts.flatMap(post => post.comments).find(c => c.id === commentID);
            if (comment) {
                if (comment.liked) {
                    cancelLikeComment(commentID)
                        .then(() => {
                            comment.likes -= 1;
                            comment.liked = false;
                        })
                        .catch(error => {
                            console.error('Error canceling like on comment:', error);
                        });
                } else {
                    likeComment(commentID)
                        .then(() => {
                            comment.likes += 1;
                            comment.liked = true;
                        })
                        .catch(error => {
                            console.error('Error liking comment:', error);
                        });
                }
            }
        },
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
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;

}

.forum-container {
    display: flex;
    justify-content: space-between;
    padding: 20px 30px;
    max-width: 1200px;
    margin: 60px auto 0;
    /* 在顶部留出60px空间 */
}

.category-sidebar {
    width: 200px;
    padding-right: 20px;
}

.category-item {
    background-color: #fff;
    color: #007bff;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 5px;
    border: 2px solid #007bff;
    text-align: center;
    cursor: pointer;
}

.main-content {
    width: 800px;
    padding: 0 50px;
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

.right-sidebar {
    width: 25%;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.personal-center-btn,
.create-post-btn {
    background-color: #fff;
    color: #007bff;
    padding: 10px 20px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 2px solid #007bff;
    cursor: pointer;
    text-align: center;
    width: 100%;
}

.hot-posts {
    width: 100%;
}

.hot-post-item {
    background-color: #fff;
    color: #007bff;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 5px;
    border: 2px solid #007bff;
    cursor: pointer;
    text-align: center;
}

.new-post-modal,
.post-detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.new-post-content,
.post-detail-content {
    background-color: #fff;
    padding: 30px;
    border-radius: 10px;
    width: 500px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.input-title,
.input-content,
.select-category,
.upload-input {
    width: 100%;
    margin-bottom: 15px;
    padding: 12px;
    border-radius: 5px;
    border: 1px solid #ddd;
    font-size: 16px;
}

.btn-primary {
    background-color: #007bff;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    margin-right: 10px;
}

.btn-secondary {
    background-color: #6c757d;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
}
</style>
