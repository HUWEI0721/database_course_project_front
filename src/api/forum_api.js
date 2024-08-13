import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://yourapi.com/api', // 替换成接口
    headers: {
        'Content-Type': 'application/json',
    },
});

// 发帖
export const publishPost = (post) => {
    return apiClient.post('/PostContoller/PublishPost', post);
};

// 查看用户帖子
export const getPostsByUserID = (userID) => {
    return apiClient.get(`/PostContoller/GetPostByUserID`, {
        params: { userID },
    });
};

// 查看所有帖子
export const getAllPosts = () => {
    return apiClient.get('/PostContoller/GetAllPost');
};

// 搜索帖子
export const searchPost = (query, category = '', dateRange = '', sortBy = '') => {
    return apiClient.get('/PostContoller/SearchPost', {
        params: { query, category, dateRange, sortBy },
    });
};

// 删除帖子
export const deletePostByPostID = (postId, role) => {
    return apiClient.delete(`/PostContoller/DeletePostByPostID`, {
        params: { postId, role },
    });
};

// 点赞帖子
export const likePost = (postID) => {
    return apiClient.post('/PostContoller/likePost', { postID });
};

// 取消点赞帖子
export const cancelLikePost = (postID) => {
    return apiClient.delete('/PostContoller/CancleLikePost', {
        params: { postID },
    });
};

// 转发帖子
export const forwardPost = (postID, userID) => {
    return apiClient.post('/PostContoller/ForwardPost', { postID, userID });
};

// 获取帖子评论
export const getCommentsByPostID = (postID) => {
    return apiClient.get(`/CommentController/GetCommentByPostID`, {
        params: { postID },
    });
};

// 发表评论
export const publishComment = (comment) => {
    return apiClient.post('/CommentController/PublishComment', comment);
};

// 回复评论
export const replyComment = (comment) => {
    return apiClient.post('/CommentController/ReplyComment', comment);
};

// 删除评论
export const deleteComment = (commentID) => {
    return apiClient.delete(`/CommentController/DeleteComment`, {
        params: { commentID },
    });
};

// 点赞评论
export const likeComment = (commentID) => {
    return apiClient.post('/CommentContoller/likeComment', { commentID });
};

// 取消点赞评论
export const cancelLikeComment = (commentID) => {
    return apiClient.delete('/CommentContoller/CancleLikeComment', {
        params: { commentID },
    });
};
