import axios from 'axios';

export const postMixin = {
    methods: {
        toggleLike(post) {
            const token = this.$store.state.token; // 从 Vuex 获取 token
            if (post.liked) {
                axios.delete('http://localhost:8080/api/PostContoller/CancleLikePost', {
                    params: { postID: post.postID },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(() => {
                        post.likesCount -= 1;
                        post.liked = false;
                    })
                    .catch(error => {
                        console.error('取消点赞时发生错误:', error);
                    });
            } else {
                axios.post('http://localhost:8080/api/Post/likePost', null, {
                    params: { postID: post.postID },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(() => {
                        post.likesCount += 1;
                        post.liked = true;
                    })
                    .catch(error => {
                        console.error('点赞时发生错误:', error);
                    });
            }
        },

        getCommentCount(postID) {
            const token = this.$store.state.token;
            return axios.get('http://localhost:8080/api/Comment/GetCommentByPostID', {
                params: { postID: postID },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
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
                    console.error('获取评论时发生错误:', error);
                    return 0;
                });
        },

        viewPost(postID) {
            this.$router.push({ name: 'PostDetail', params: { postID: postID } });
        }
    }
};
