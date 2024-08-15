<template>
    <NavigationBar />
    <div class="forum-bg"> <!-- 保持与 ForumView.vue 一致的背景 -->
        <div class="post-container">
            <h1 class="post-title">{{ post.title }}</h1>

            <div class="post-info">
                <span class="post-author" @click="goToAuthorProfile">{{ post.name }}</span>
                <span class="post-time">{{ post.postTime }}</span>
                <span class="post-views">👁️ {{ post.views }}</span>
            </div>

            <div class="post-content">
                <p>{{ post.content }}</p>
            </div>

            <div class="post-actions">
                <button @click="toggleLike" class="btn-action">👍 {{ post.liked ? '取消点赞' : '点赞' }} {{ post.likesCount
                    }}</button>
                <button @click="toggleComments" class="btn-action">💬 评论 {{ post.comments.length }}</button>
                <button class="btn-action">🚩 举报</button>
                <button class="btn-action">🔗 分享</button>
            </div>

            <div v-if="showComments" class="comments-section">
                <h3>评论</h3>
                <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                    <p><strong>{{ comment.author }}</strong>: {{ comment.text }}</p>
                    <div class="comment-actions">
                        <span @click="likeComment(comment.id)">👍 {{ comment.likes }}</span>
                        <span @click="replyToComment(comment.id)">回复</span>
                    </div>
                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                        <p><strong>@{{ reply.replyTo }}: {{ reply.author }}</strong> {{ reply.text }}</p>
                    </div>
                </div>
                <textarea v-model="newCommentText" placeholder="写下你的评论..."></textarea>
                <button @click="addComment">发表评论</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import NavigationBar from "@/components/NavigationBar.vue";

export default {
    components: { NavigationBar },
    data() {
        return {
            showComments: false,
            newCommentText: "",
            post: null,
        };
    },
    computed: {
        ...mapState(["filteredPosts"]),
    },
    created() {
        const postId = this.$route.params.id;
        this.post = this.posts.find(post => post.id === parseInt(postId));
        if (this.post) {
            this.post.views += 1;
        }
    },
    methods: {
        toggleLike() {

            if (this.post.liked) {
                this.post.likesCount -= 1;
                this.post.liked = false; // 取消点赞
            } else {
                this.post.likesCount += 1;
                this.post.liked = true; // 点赞
            }
        }
    },
};
</script>

<style scoped>
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

.post-container {
    display: flex;
    flex-direction: column;
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
    background-color: #fff;
    /* 保持白色背景，与 ForumView.vue 中帖子项保持一致 */
    border-radius: 5px;
    border: 2px solid #ddd;
}

.post-title {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
}

.post-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 14px;
    color: #777;
}

.post-author {
    color: #007bff;
    cursor: pointer;
}

.post-content {
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.6;
    color: #444;
}

.post-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.btn-action {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    border: none;
}

.comments-section {
    margin-top: 40px;
}

.comment-item,
.reply-item {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 5px;
    border: 1px solid #ddd;
}

.comment-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    font-size: 14px;
    color: #555;
}

textarea {
    width: 100%;
    height: 60px;
    margin-top: 10px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    font-size: 14px;
    resize: none;
}
</style>
