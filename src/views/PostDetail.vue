<template>
    <div class="forum-bg">
        <button class="back-button" @click="goBack">
            <icon-arrow-left />
        </button>

        <!-- 相关帖子推荐 -->
        <el-card class="card">
            <div class="related-posts-section">
                <el-row class="row">
                    <el-col :span="20">
                        <el-text class="title">相关帖子推荐</el-text>
                    </el-col>
                </el-row>
                <div class="related-posts-content">
                    <el-divider />
                    <div v-for="post in relatedPosts" :key="post.postID">
                        <el-text @click="goToPost(post.postID)" class="related-post-title">{{ post.postTitle
                            }}</el-text>
                        <el-divider />
                    </div>
                </div>
            </div>
        </el-card>

        <div class="post-container">
            <h1 class="post-title">{{ post.postTitle }}</h1>

            <div class="post-info">
                <span class="post-author" @click="goToAuthorProfile">{{ post.userName }}</span>
                <span class="post-time">{{ post.postTime }}</span>
            </div>

            <div class="post-content">
                <p>{{ post.postContent }}</p>
            </div>

            <div class="post-actions">
                <button @click="toggleLike(post.postID)" class="btn-action">
                    👍 {{ postLiked ? '取消' : '点赞' }} {{ post.likesCount }}
                </button>
                <button @click="toggleComments" class="btn-action">
                    💬 评论 {{ post.commentsCount }}
                </button>
                <button @click="reportPost" class="btn-action">🚩 举报</button>
                <button @click="openShareDialog" class="btn-action">🔗 分享</button>
                <button @click="forwardPost" class="btn-action">🔄 转发</button>
            </div>

            <div v-if="showComments" class="comments-section">
                <h3>评论</h3>
                <div v-for="comment in comments" :key="comment.commentID" class="comment-item">
                    <p><strong>{{ comment.userName }}</strong>: {{ comment.content }}</p>
                    <div class="comment-actions">
                        <span @click="likeComment(comment.commentID)">
                            👍 {{ comment.likedByCurrentUser ? '取消' : '点赞' }} {{ comment.likesCount }}
                        </span>
                        <span @click="setReplyTarget(comment)">回复</span>
                        <span v-if="isCurrentUser(comment.userName)" @click="deleteComment(comment.commentID)">删除</span>
                        <button @click="toggleReplies(comment)" class="btn-action">显示回复</button>
                    </div>

                    <!-- 评论的回复 -->
                    <div v-if="comment.showReplies" v-for="reply in comment.replies" :key="reply.commentID"
                        class="reply-item">
                        <p><strong>@{{ reply.userName }}: </strong>{{ reply.content }}</p>
                        <div class="comment-actions">
                            <span @click="likeComment(reply.commentID)">
                                👍 {{ reply.likedByCurrentUser ? '取消' : '点赞' }} {{ reply.likesCount }}
                            </span>
                            <span @click="setReplyTarget(reply)">回复</span>
                            <span v-if="isCurrentUser(reply.userName)" @click="deleteReply(reply.commentID)">删除</span>
                        </div>
                    </div>
                </div>

                <!-- 回复目标显示 -->
                <div v-if="replyingTo" class="replying-to">
                    <p>正在回复 @{{ replyingTo.userName }} 的评论：</p>
                </div>

                <!-- 输入框和提交按钮 -->
                <div class="input-container">
                    <textarea v-model="newCommentText" placeholder="写下你的评论..." @focus="clearReplyTarget"></textarea>
                    <div class="actions">
                        <button class="emoji-button" ref="emojiButton" @click="toggleEmojiPicker">😊</button>
                        <button class="btn-primary" @click="addComment">发表评论</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 热帖推荐 -->
        <el-card class="right-sidebar">
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
                    <el-text v-for="hotPost in hotPosts" :key="hotPost.postID" @click="goToPost(hotPost.postID)"
                        class="hot-post-title">
                        <icon-fire class="icon-fire-small" /> {{ hotPost.postTitle }}
                    </el-text>
                    <el-divider />
                </div>
            </div>
        </el-card>

        <!-- 分享弹窗 -->
        <el-dialog title="分享帖子" :visible="shareDialogVisible" width="30%" v-model="shareDialogVisible">
            <div>
                <p>复制下面的链接分享给他人：</p>
                <el-input v-model="shareLink" readonly></el-input>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="shareDialogVisible = false">关闭</el-button>
                    <el-button type="primary" @click="copyLink">复制链接</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 举报弹窗 -->
        <el-dialog title="确认举报" v-model:visible="reportDialogVisible" width="30%">
            <div>
                <p>你确定要举报此帖子吗？</p>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="reportDialogVisible = false">取消</el-button>
                    <el-button type="danger" @click="confirmReport">确认举报</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';
import { IconArrowLeft, IconFire } from '@arco-design/web-vue/es/icon';
import { EmojiButton } from '@joeattardi/emoji-button';

export default {
    components: {
        IconArrowLeft,
        IconFire,
    },
    data() {
        return {
            showComments: false,
            newCommentText: "",
            replyingTo: null, // 当前回复的目标
            post: {
                postID: null,
                userID: null,
                userName: '',
                postTitle: '',
                postContent: '',
                postTime: '',
                likesCount: null,
                forwardCount: null,
                commentsCount: null,
                refrencePostID: null
            },
            postLiked: false,
            // comment:{
            //     commentID: null,
            //     userID: null,
            //     postID: null,
            //     parentCommentID: null,
            //     commentTime: null,
            //     likesCount: null,
            //     content: ''
            // },
            comments: [],
            shareDialogVisible: false,
            reportDialogVisible: false,
            shareLink: ""
        };
    },
    mounted() {
        this.emojiPicker = new EmojiButton({
            position: 'bottom-start',
            zIndex: 9999, // 确保在所有元素之上
        });
        this.emojiPicker.on('emoji', selection => {
            this.newCommentText += selection.emoji; // 确保加入的是表情符号而不是代码
        });
    },
    methods: {
        isCurrentUser(userName) {
            return this.currentUser === userName;
        },
        fetchPostDetail() {
            const token = localStorage.getItem('token');
            const postID = this.$route.params.postID;
            axios.get(`http://localhost:8080/api/Post/GetPostByPostID`, {
                params: {
                    token: token,
                    postID: postID
                }
            })
                .then(response => {
                    this.post = response.data;
                    this.fetchComments(postID);
                })
                .catch(error => {
                    console.error('获取帖子详情时发生错误:', error);
                });
        },
        fetchComments(postID) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/Comment/GetCommentByPostID`, {
                params: {
                    token: token,
                    postID: postID
                }
            })
                .then(response => {
                    this.comments = response.data;
                })
                .catch(error => {
                    console.error('获取评论时发生错误:', error);
                });
        },
        fetchReplies(commentID) {
            const token = localStorage.getItem('token');
            return axios.get(`http://localhost:8080/api/Comment/GetCommentByCommentID`, {
                params: {
                    token: token,
                    commentID: commentID
                }
            })
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('获取回复时发生错误:', error);
                });
        },
        toggleReplies(comment) {
            if (!comment.showReplies) {
                this.fetchReplies(comment.commentID).then(replies => {
                    this.$set(comment, 'replies', replies);
                    this.$set(comment, 'showReplies', true);
                });
            } else {
                comment.showReplies = false;
            }
        },
        goBack() {
            this.$router.go(-1);
        },
        toggleLike(postID) {
            const token = this.$store.state.token;
            if (this.postLiked) {
                axios.delete('http://localhost:8080/api/PostContoller/CancleLikePost', {
                    params: { postID: postID },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(() => {
                        this.post.likesCount -= 1;
                        this.postLiked = false;
                    })
                    .catch(error => {
                        console.error('取消点赞时发生错误:', error);
                    });
            } else {
                axios.post('http://localhost:8080/api/Post/likePost', null, {
                    params: { postID: postID },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(() => {
                        this.post.likesCount += 1;
                        this.postLiked = true;
                    })
                    .catch(error => {
                        console.error('点赞时发生错误:', error);
                    });
            }
        },
        addComment() {
            const token = localStorage.getItem('token');
            if (this.newCommentText.trim()) {
                const newComment = {
                    commentID: -1,
                    userID: this.$store.state.userID,
                    postID: this.post.postID,
                    parentCommentID: this.replyingTo ? this.replyingTo.commentID : -1,
                    commentTime: new Date().toISOString(),
                    likesCount: 0,
                    content: this.newCommentText.trim()
                };

                if (this.replyingTo) {
                    axios.post(`http://localhost:8080/api/Comment/ReplyComment?token=${token}`, newComment)
                        .then(response => {
                            if (response.data.message === '回复成功') {
                                this.replyingTo.replies.push(newComment);
                                this.replyingTo = null;
                            } else {
                                this.$message.error('回复失败');
                            }
                        })
                        .catch(error => {
                            console.error('回复时发生错误:', error);
                        });
                } else {
                    axios.post(`http://localhost:8080/api/Comment/PublishComment?token=${token}`, newComment)
                        .then(response => {
                            if (response.data.message === '发布评论成功') {
                                this.comments.push(newComment);
                                this.post.commentsCount++;
                                this.newCommentText = "";
                            } else {
                                this.$message.error('发布评论失败');
                            }
                        })
                        .catch(error => {
                            console.error('发表评论时发生错误:', error);
                        });
                }
            }
        },
        likeComment(commentID) {
            const token = localStorage.getItem('token');
            axios.post('http://localhost:8080/api/Comment/likeComment', {
                params: {
                    token: token,
                    commentID: commentID
                }
            })
                .then(response => {
                    if (response.data.message === '点赞成功') {
                        const comment = this.comments.find(c => c.commentID === commentID);
                        comment.likesCount++;
                        comment.likedByCurrentUser = true;
                    } else {
                        this.$message.error('点赞失败');
                    }
                })
                .catch(error => {
                    console.error('点赞时发生错误:', error);
                });
        },
        deleteComment(commentID) {
            const token = localStorage.getItem('token');
            axios.delete('http://localhost:8080/api/Comment/DeleteComment', {
                params: {
                    token: token,
                    commentID: commentID
                }
            })
                .then(response => {
                    if (response.data.message === '评论删除成功') {
                        this.comments = this.comments.filter(c => c.commentID !== commentID);
                        this.post.commentsCount--;
                    } else {
                        this.$message.error('删除评论失败');
                    }
                })
                .catch(error => {
                    console.error('删除评论时发生错误:', error);
                });
        },
        setReplyTarget(comment) {
            this.replyingTo = comment;
            this.newCommentText = `@${comment.userName} `;
        },
        clearReplyTarget() {
            if (!this.newCommentText.trim()) {
                this.replyingTo = null;
            }
        },
        toggleComments() {
            this.showComments = !this.showComments;
        },
        openShareDialog() {
            this.shareLink = `${window.location.origin}/post/${this.post.postID}`;
            this.shareDialogVisible = true;
        },
        copyLink() {
            navigator.clipboard.writeText(this.shareLink).then(() => {
                this.$message.success('链接已复制到剪贴板！');
            });
        },
        reportPost() {
            this.reportDialogVisible = true;
        },
        confirmReport() {
            this.$message.success('感谢你的反馈，举报已提交。');
            this.reportDialogVisible = false;
        },
        goToAuthorProfile() {
            this.$router.push(`/user/:userID=${this.post.userID}`);
        },
        forwardPost() {
            const token = localStorage.getItem('token');
            const postID = this.$route.params.postID;
            axios.get(`http://localhost:8080/api/Post/ForwardPost`, {
                params: {
                    token: token,
                    postID: postID
                }
            })
                .then(response => {
                    if (response.data.message === '成功转发') {
                        this.post.forwardCount++;
                    } else {
                        console.error('转发帖子失败:', response.data.message);
                    }
                })
                .catch(error => {
                    console.error('转发帖子时发生错误:', error);
                });
        },
        fetchRelatedPosts() {
            axios.get('http://localhost:8080/api/Post/GetAllPost')
                .then(response => {
                    const allPosts = response.data;
                    const sameCategoryPosts = allPosts.filter(
                        post => post.postCategory === this.post.postCategory
                    );
                    this.relatedPosts = sameCategoryPosts.sort(() => 0.5 - Math.random()).slice(0, 5);
                })
                .catch(error => {
                    console.error('获取相关帖子时发生错误:', error);
                });
        },
        fetchHotPosts() {
            axios.get('http://localhost:8080/api/Post/GetAllPost')
                .then(response => {
                    const allPosts = response.data;
                    this.hotPosts = allPosts
                        .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
                        .slice(0, 5);
                })
                .catch(error => {
                    console.error('获取热帖时发生错误:', error);
                });
        },
        goToPost(postID) {
            this.$router.push(`/post/${postID}`);
        },
        toggleEmojiPicker() {
            document.body.style.overflow = this.emojiPicker.isOpen ? '' : 'hidden';
            this.emojiPicker.togglePicker(this.$refs.emojiButton);
        },
        beforeDestroy() {
            // 恢复滚动条状态
            document.body.style.overflow = '';
        },
    },


}
</script>

<style scoped>
.forum-bg {
    display: flex;
    background-image: url('../components/icons/forum-bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    width: 100%;
    min-height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    padding-bottom: 60px;
    overflow-y: scroll;
}

.post-container {
    display: flex;
    flex-direction: column;
    width: 800px;
    margin: 0 auto;
    background-color: transparent;
    border: none;
}

.post-title {
    text-align: center;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
}

.post-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 50px;
    font-size: 14px;
    color: #777;
}

.post-info span {
    display: inline-flex;
    align-items: center;
}

.post-author {
    color: #007bff;
    cursor: pointer;
}

.post-content {
    padding: 20px;
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.6;
    color: #444;
}

.post-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: transparent;
    border: none;
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 10px 0;
    z-index: 100;
}

.btn-action {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    border: none;
}

.comments-section {
    margin-top: 40px;
    width: 800px;
}

.comment-item,
.reply-item {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 5px;
    border: 1px solid #ddd;
    width: 800px;
}

.comment-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    font-size: 14px;
    color: #555;
}

.replying-to {
    margin: 10px 0;
    color: #007bff;
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

.input-container {
    position: relative;
    width: 100%;
}

.actions {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
}

.emoji-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    position: relative;
}

.btn-primary {
    background-color: #007bff;
    color: #fff;
    padding: 8px 16px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-size: 14px;
}

.back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background-color: #FFFAFA;
    border-radius: 10px;
    border: none;
    font-size: 30px;
    cursor: pointer;
    padding: 1px 10px;
    transition: background-color 0.3s ease;
}

.back-button:hover {
    background-color: #33ff33;
    /* 鼠标悬停时的背景颜色 */
}

.card {
    margin-top: 65px;
    width: 300px;
    height: max-content;
    background-color: transparent;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    margin-bottom: 20px;
}

.related-posts-section .title,
.hot-posts-section .title {
    font-size: 16px;
    font-weight: bolder;
    color: #000;
    padding-left: 0;
}

.related-post-title,
.hot-post-title {
    font-size: 14px;
    color: #007bff;
    cursor: pointer;
    padding-left: 16px;
}

.related-post-title:hover,
.hot-post-title:hover {
    text-decoration: underline;
}

.row {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    margin-left: 20px;
}

.right-sidebar {
    margin-top: 65px;
    width: 300px;
    background-color: transparent;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    margin-bottom: 10px;
    padding-left: 0;
    display: flex;
    flex-direction: column;
    align-items: left;
}

.hot-posts-content {
    padding-left: 16px;
    padding-right: 16px;
}

.icon-fire-small {
    font-size: 16px;
    margin-right: 8px;
}
</style>
