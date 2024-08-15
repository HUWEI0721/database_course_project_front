import { createStore } from 'vuex'


// 在 store.js 中
export default createStore({
    state: {
        role: localStorage.getItem('role') || 'unAuthenticated',
        userID: localStorage.getItem('userID') || '',
        token: localStorage.getItem('token') || '',
        recipe: localStorage.getItem('recipe') || '',
        // role: 'unAuthenticated',
        // username: '',
        // token: '',
        categories: ["全部帖子", "健身计划", "饮食营养", "健身打卡", "健身问答", "健身挑战", "设备器材", "健身分享", "活动赛事", "初学指南",]
    },
    mutations: {
        setRole(state, role) {
            state.role = role;
            // 将数据保存到 LocalStorage
            localStorage.setItem('role', role);
        },
        setUserID(state, userID) {
            state.userID = userID;
            localStorage.setItem('userID', userID);
        },
        setToken(state, token) {
            state.token = token;
            localStorage.setItem('token', token);
        },
        setRecipe(state, recipe) {
            state.recipe = recipe;
            localStorage.setItem('recipe', recipe);
        },
        removeRecipe(state, recipe) {
            state.recipe = undefined;
            localStorage.removeItem('recipe');
        },
        updatePost(state, updatedPost) {
            const index = state.posts.findIndex(post => post.id === updatedPost.id);
            if (index !== -1) {
                state.posts.splice(index, 1, updatedPost); // 替换更新后的帖子数据
            }
        },
    },
    actions: {
        // 在这里可以添加异步操作
    },
    modules: {
        // 在这里可以添加模块
    },
});