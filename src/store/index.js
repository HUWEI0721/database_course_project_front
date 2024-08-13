import { createStore } from 'vuex'


// 在 store.js 中
export default createStore({
    state: {
        role: localStorage.getItem('role') || 'unAuthenticated',
        username: localStorage.getItem('username') || '',
        token: localStorage.getItem('token') || '',
        recipe: localStorage.getItem('recipe') || '',
        // role: 'unAuthenticated',
        // username: '',
        // token: '',
        posts: [
            {
                id: 1,
                title: "帖子标题1",
                snippet: "帖子内容摘要...",
                content: "这是帖子详细内容...",
                author: "用户1",
                category: "帖子类别1",
                likes: 10,
                views: 100,
                liked: false,
                comments: [],
                media: null,
            },
            {
                id: 2,
                title: "帖子标题2",
                snippet: "帖子内容摘要...",
                content: "这是帖子详细内容...",
                author: "用户2",
                category: "帖子类别2",
                likes: 15,
                views: 200,
                liked: false,
                comments: [],
                media: null,
            },
            // 更多帖子数据...
        ],
        hotPosts: [
            {
                id: 1,
                title: "热帖1",
                snippet: "帖子内容摘要...",
                content: "这是帖子详细内容...",
                author: "用户1",
                category: "帖子类别1",
                likes: 10,
                views: 100,
                liked: false,
                comments: [],
                media: null,
            },
            {
                id: 2,
                title: "热帖2",
                snippet: "帖子内容摘要...",
                content: "这是帖子详细内容...",
                author: "用户2",
                category: "帖子类别2",
                likes: 15,
                views: 200,
                liked: false,
                comments: [],
                media: null,
            },
            // 更多帖子数据...
        ],
        relatedPosts: [
            {
                id: 1,
                title: "其他帖子1",
                snippet: "帖子内容摘要...",
                content: "这是帖子详细内容...",
                author: "用户1",
                category: "帖子类别1",
                likes: 10,
                views: 100,
                liked: false,
                comments: [],
                media: null,
            },
            {
                id: 2,
                title: "其他帖子2",
                snippet: "帖子内容摘要...",
                content: "这是帖子详细内容...",
                author: "用户2",
                category: "帖子类别2",
                likes: 15,
                views: 200,
                liked: false,
                comments: [],
                media: null,
            },
            // 更多帖子数据...
        ]
    },
    mutations: {
        setRole(state, role) {
            state.role = role;
            // 将数据保存到 LocalStorage
            localStorage.setItem('role', role);
        },
        setUsername(state, username) {
            state.username = username;
            localStorage.setItem('username', username);
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