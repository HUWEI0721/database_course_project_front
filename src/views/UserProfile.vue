<template>
    <div class="bg">
        <div class="user-profile">
            <div class="profile-container">
                <aside class="profile-sidebar">
                    <div class="avatar-wrapper" @click="showLargeImage">
                        <img :src="imagePreview || profile.iconURL || defaultAvatar" alt="avatar" class="avatar">
                        <span class="edit-icon" @click.stop="triggerFileInput">&#9998;</span>
                    </div>
                    <h2>{{ profile.userName }}</h2>
                    <div class="tags">
                        <span v-for="(tag, index) in profile.tags" :key="index" class="tag"
                            :style="{ backgroundColor: tag.color }">{{ tag.text }}</span>
                        <span v-if="addingTag" class="tag-input">
                            <input type="text" v-model="newTag" @blur="addTag" @keyup.enter="addTag" />
                        </span>
                        <span class="add-tag" @click="addingTag = true">+</span>
                    </div>
                    <input type="file" @change="handleFileUpload" ref="fileInput" class="file-input" />
                </aside>

                <main class="profile-main">
                    <!-- 第一行：用户ID、邮箱、注册时间 -->
                    <section class="profile-info">
                        <div class="info-row">
                            <div class="profile-viewer">
                                <label>用户ID</label>
                                <p>{{ profile.userID }}</p>
                            </div>
                            <div class="profile-viewer">
                                <label>邮箱</label>
                                <p>{{ profile.email }}</p>
                            </div>
                            <div class="profile-viewer">
                                <label>注册时间</label>
                                <p>{{ profile.registrationTime }}</p>
                            </div>
                        </div>
                    </section>
                    <!-- 第二行：密码 -->


                    <!-- 第三行：昵称、年龄、性别 -->
                    <section class="profile-info">
                        <div class="info-row uniform-row">
                            <EditableField label="昵称" :value="profile.userName" type="input"
                                @save="profile.userName = $event" />
                            <EditableField label="年龄" :value="profile.age" type="input" @save="profile.age = $event" />
                            <div class="profile-editor">
                                <label>性别</label>
                                <select v-model="profile.gender">
                                    <option value="男">男</option>
                                    <option value="女">女</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <!-- 第四行：类型、体重、身高 -->
                    <section class="profile-info">
                        <div class="info-row uniform-row">
                            <EditableField label="类型" :value="profile.goalType" type="input"
                                @save="profile.goalType = $event" />
                            <EditableField label="体重" :value="profile.goalWeight" type="input"
                                @save="profile.goalWeight = $event" />

                        </div>
                    </section>

                    <!-- 第五行：会员状态 -->
                    <section class="profile-editor">
                        <label>会员状态:</label>
                        <p> {{ profile.isMember ? '会员' : '普通用户' }}</p>
                    </section>

                    <!-- 第六行：个性签名 -->
                    <section class="profile-info">
                        <div class="signature-editor signature-textarea">
                            <label>个性签名</label>
                            <textarea v-model="profile.introduction" @blur="emitSave('introduction')"></textarea>
                        </div>
                    </section>

                    <!-- 保存和取消按钮 -->
                    <div class="profile-actions">
                        <button @click="cancelEdit" class="cancel-button">取消</button>
                        <button @click="saveProfile" class="save-button">保存</button>
                    </div>

                    <!-- 帖子列表部分 -->
                    <section class="post-list">
                        <h3>用户的帖子</h3>
                        <div v-if="posts.length === 0">该用户尚未发布任何帖子。</div>
                        <ul v-else>
                            <li v-for="post in posts" :key="post.postID" class="post-item">
                                <h4>{{ post.postTitle }}</h4>
                                <p>{{ post.postContent }}</p>
                                <small>{{ new Date(post.postTime).toLocaleString() }}</small>
                            </li>
                        </ul>
                    </section>


                </main>
            </div>

            <!-- 模态框显示大图 -->
            <div v-if="isLargeImageVisible" class="modal" @click="hideLargeImage">
                <img :src="imagePreview || profile.iconURL || defaultAvatar" alt="Large avatar" class="large-avatar">
            </div>
        </div>
    </div>
</template>

<script>
import defaultAvatar from '@/assets/images/default-avatar.png';
import EditableField from './EditableField.vue';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    components: {
        EditableField,
    },
    data() {
        return {
            profile: {
                /*userID: null,
                userName: '',
                password: '',
                salt:'',
                email: '',
                registrationTime: '',
                iconURL: '', // 这里可以为空或者实际路径
                age: null,
                gender: '',
                tags: '',
                introduction: '',
                goalType: '',
                goalWeight: null,
                isMember: null,
                isPost: null,
                isDelete: null*/
                userID: 2,
                userName: 'hhh',
                password: 'dfgdgdfg',
                salt: 'dsgg',
                email: 'dfg@qq.com',
                registrationTime: '2023-01-01 00:00:00',
                iconURL: '', // 这里可以为空或者实际路径
                age: 15,
                gender: '男',
                tags: '帅气',
                introduction: '阿凡达啊方法呃',
                goalType: 'aaaa',
                goalWeight: null,
                isMember: null,
                isPost: null,
                isDelete: null
            },
            posts: [{
                postID: null,
                userID: null,
                postTitle: '',
                postContent: '',
                postTime: '',
                likesCount: null,
                forwardCount: null,
                commentsCount: null,
                refrencePostID: null
            }], // 用户的帖子列表
            colors: ['#e57373', '#81c784', '#64b5f6', '#ffb74d', '#ba68c8', '#4db6ac'],
            addingTag: false,
            newTag: '',
            originalProfile: null, // 保存原始数据以便取消时恢复
            defaultAvatar,
            imagePreview: null, // 用于存储图片预览的路径
            isLargeImageVisible: false, // 控制大图显示
        };
    },
    computed: {
        ...mapState(['token'])
    },
    created() {
        this.fetchUserProfile();
        this.fetchUserPosts(); // 获取用户帖子
    },
    methods: {
        async fetchUserProfile() {
            //const userID = this.$route.params.userID;
            const token = localStorage.getItem('token');
            //console.log(token)
            try {
                const response = await axios.get(`http://localhost:8080/api/User/GetPersonalProfile?token=${token}`);
                this.profile = response.data;
                this.originalProfile = JSON.parse(JSON.stringify(this.profile));
                console.log('this.profile:', this.profile)
                console.log('接收到的用户资料响应数据:', response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        },
        async fetchUserPosts() {
            //const userID = this.$route.params.userID;
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:8080/api/Post/GetPersonalPost?token=${token}`);
                this.posts = response.data;
                console.log('User posts fetched:', this.posts);
            } catch (error) {
                console.error('Error fetching user posts:', error);
            }
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imagePreview = e.target.result;
                    this.profile.iconURL = file.name; // 实际应用中需要将文件上传至服务器并获取URL
                };
                reader.readAsDataURL(file);
            }
        },
        emitSave(field) {
            console.log(`${field} updated:`, this.profile[field]);
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        showLargeImage() {
            this.isLargeImageVisible = true;
        },
        hideLargeImage() {
            this.isLargeImageVisible = false;
        },
        addTag() {
            if (this.newTag) {
                const colorIndex = Math.floor(Math.random() * this.colors.length);
                this.profile.tags.push({ text: this.newTag, color: this.colors[colorIndex] });
                this.newTag = '';
                this.addingTag = false;
            }
        },
        cancelEdit() {
            this.profile = JSON.parse(JSON.stringify(this.originalProfile));
        },
        async saveProfile() {
            try {
                const response = await axios.put('http://localhost:8080/api/User/UpdateProfile', {
                    userID: this.profile.userID,
                    userName: this.profile.nickname,
                    password: this.profile.password,
                    salt: null,
                    email: this.profile.email,
                    iconURL: this.profile.iconURL,
                    age: this.profile.age,
                    gender: this.profile.gender,
                    tags: this.profile.tags.map(tag => `${tag.text}:${tag.color}`).join(','),
                    introduction: this.profile.introduction,
                    goalType: this.profile.goalType,
                    goalWeight: this.profile.goalWeight,
                    isMember: this.profile.isMember,
                    isPost: -1,
                    isDelete: -1
                }, {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });

                console.log('Profile updated successfully:', response.data);
                this.originalProfile = JSON.parse(JSON.stringify(this.profile));
                alert('保存成功！');
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        }
    }
};
</script>

<style scoped>
.bg {
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
}

.user-profile {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    overflow: auto;
    background-color: transparent;
}

.profile-container {
    display: flex;
    width: 100%;
    max-width: 1300px;
    margin: auto;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    justify-content: space-between;
    background-color: transparent;
}

.profile-sidebar {
    width: 20%;
    padding: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: transparent;
    border: none;
}

.profile-main {
    width: 80%;
    margin-left: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.avatar-wrapper {
    position: relative;
    cursor: pointer;
}

.avatar {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    position: relative;
}

.edit-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #42b983;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    padding: 5px 10px;
    transform: translate(1%, 1%);
    /* 调整 transform，使图标更加贴近头像的右下角 */
}

.file-input {
    display: none;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 10px;
    justify-content: center;
}

.tag {
    border-radius: 15px;
    padding: 5px 10px;
    font-size: 14px;
    color: white;
    margin: 3px;
    display: inline-block;
}

.tag-input input {
    padding: 5px;
    border-radius: 15px;
    border: 1px solid #ccc;
}

.add-tag {
    background-color: #42b983;
    color: white;
    border-radius: 50%;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    display: flex;
    align-items: center;
}

.profile-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.uniform-row>.editable-field,
.uniform-row>.profile-editor {
    flex: 1;
}

p {
    height: 40px;
    margin: 5px 0;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: transparent;
}

.profile-editor,
.profile-viewer {
    display: flex;
    flex-direction: column;
    width: 32%;
    margin-bottom: 10px;
}

input,
select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: transparent;
    height: 50px;
    /* 增加输入框和选择框的高度 */
    font-size: 16px;
    width: 100%;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.large-avatar {
    max-width: 90%;
    max-height: 90%;
    border-radius: 10px;
}

.signature-editor {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 10px;
}

.signature-textarea textarea {
    height: 150px;
    font-size: 16px;
    line-height: 1.5;
    width: 100%;
    border-radius: 4px;
    background-color: transparent;
    resize: none;
    border: 1px solid #ccc;
    padding: 10px;
}

.profile-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.cancel-button,
.save-button {
    padding: 10px 20px;
    margin-left: 10px;
    border-radius: 4px;
    cursor: pointer;
}

.cancel-button {
    background-color: #d9534f;
    color: white;
}

.save-button {
    background-color: #5cb85c;
    color: white;
}

/* 新增的帖子列表样式 */
.post-list {
    margin-top: 20px;
}

.post-item {
    padding: 10px;
    border-bottom: 1px solid #ccc;
}

.post-item h4 {
    margin: 0;
    font-size: 18px;
}

.post-item p {
    margin: 5px 0;
    font-size: 14px;
    color: #555;
}

.post-item small {
    color: #999;
}
</style>
