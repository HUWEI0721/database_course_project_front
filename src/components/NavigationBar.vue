<template>
    <div class="head_con">
        <div class="wrapper">
            <nav>
                <label for="forum" class="forum" @click="delayedNavigation('/forum')">
                    <el-icon>
                        <ChatSquare />
                    </el-icon>
                    健身论坛
                </label>
                <div class="tab"></div>
            </nav>
        </div>
    </div>
</template>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.head_con {
    display: flex;
    align-items: center;
    position: absolute;
    top: 3%;
    left: 0;
    width: 100%;
    padding-left: 5%;
    padding-right: 3%;
}

.wrapper {
    width: 7vw;
    line-height: 50px;
    background-color: white;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.25);
    border-radius: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    margin-left: 30%;
    padding: 5px 5px;
    position: relative;
    z-index: 100;
}

.wrapper nav {
    display: flex;
    flex: 1;
    position: relative;
}

.wrapper nav label {
    flex: 1;
    width: 100%;
    position: relative;
    z-index: 1;
    cursor: pointer;
}

.wrapper nav .tab {
    position: absolute;
    height: 100%;
    width: 8vw;
    left: -5px;
    bottom: 0px;
    background: linear-gradient(to right, #f09819, #ff5858);
    border-radius: 50px;
    transition: 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.wrapper nav #forum:checked~.tab {
    left: 0;
}
</style>

<script>
import router from "@/router/index.js";
import { ChatSquare } from "@element-plus/icons-vue";

export default {
    name: "NavigationBar",
    components: { ChatSquare },
    methods: {
        router() {
            return router;
        },
        delayedNavigation(target) {
            setTimeout(() => {
                this.router().push(target); // Navigate to the forum route
            }, 500); // 500 milliseconds delay
        }
    }
}
</script>
