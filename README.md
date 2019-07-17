<h3 align="center">MIX</h3>
<p align="center">
  更易上手的前端构建工具
</p>

## 特性

- 简化 webpack 的配置，更人性化的配置参数
- 安装命令行工具(@mixup/cli)快速搭建项目且无需重复安装依赖，基于 webpack 4
- 生成的配置完全兼容 webpack 的命令行工具


### 使用 mix 命令行工具

```shell
npm i @mixup/cli -g
```

Step 1. 创建一个 vue 项目 （将自动下载 vue 项目脚手架，只需下载一次）

```shell
$ mix create my-project vue
$ cd my-project
```

Step 2. 开始开发

```shell
$ mix watch
```

### 只安装 mix
```shell
npm i @mixup/mix -D

# 开始开发
node_modules/.bin/mix watch # or webpack --config mix.conf.js

# 如果全局安装了 mix-cli 同样可以这样做(运行的依旧是本地项目的 mix)
mix watch
```
