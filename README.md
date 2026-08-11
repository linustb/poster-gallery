# 实践海报库

北京科技大学“满井溯源·秦京铸魂”实践队的独立极简海报资料库。

该版本采用“左侧目录 + 顶部批次 + 三列固定封面”的报刊库结构：

- 4 个实践批次
- 7 个实际素材分类和 1 个自动聚合栏目
- 每个“批次 × 分类”预留 9 张海报
- 无框架、无依赖、无需构建
- 可直接部署至 GitHub Pages
- 支持分类/批次链接分享和海报大图查看

## 本地预览

可以直接双击 `index.html`，也可以在当前目录启动静态服务器：

```bash
python -m http.server 8080
```

然后访问 <http://localhost:8080>。

## 放入海报

海报路径由“批次、分类、编号”三部分组成。例如：

```text
assets/posters/batch-03/interview/poster-01.jpg
```

表示：

- 第三期：`batch-03`
- 人物访谈：`interview`
- 该分类第 1 张：`poster-01.jpg`

只要把图片放入正确目录并刷新页面，相应占位卡就会自动替换，不需要修改网页代码。

详细分类和文件名见 [assets/posters/README.md](./assets/posters/README.md)。

## “全部海报”的工作方式

`全部海报` 是自动聚合栏目，不需要建立 `all` 文件夹，也不需要复制图片。网站会自动收集当前批次各分类中已经存在的海报。

如果当前批次完全没有海报，“全部海报”会显示 9 个通用占位卡；有海报后，只陈列已发布内容。

## 链接定位

切换批次和分类时，网址会自动出现类似参数：

```text
#batch=batch-02&category=research
```

复制这个完整网址，可以直接分享“第二期 · 实地调研”页面。

## 部署到 GitHub Pages

1. 在 GitHub 新建空仓库。
2. 将 `poster-library` 文件夹内的全部内容推送到仓库根目录。
3. 打开 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 **Deploy from a branch**。
5. 选择 `main` 和 `/ (root)`，保存。
6. 等待 GitHub Pages 生成访问地址。

本站使用相对路径，因此部署到 `用户名.github.io/仓库名/` 时无需调整路径。

## 文件结构

```text
poster-library/
├─ index.html
├─ styles.css
├─ script.js
├─ README.md
└─ assets/
   ├─ logo.png
   ├─ logo-transparent.png
   ├─ cloud-waves.png
   ├─ cloud-scroll.png
   └─ posters/
      ├─ README.md
      ├─ batch-01/
      ├─ batch-02/
      ├─ batch-03/
      └─ batch-04/
```
