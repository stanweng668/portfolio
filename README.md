# 摄影作品集网站模板

极简风格的摄影师作品集,参考 yundongshu.com 的结构:左侧项目导航 + 右侧图片流。

**核心特点:日常维护不需要写代码。** 加照片、改布局、改文字,全部只操作两样东西:

1. `images/` 文件夹(放照片)
2. `data/config.json`(一个配置文件)

手机上打开 GitHub 网页也能完成全部操作。

---

## 一、首次部署(只做一次)

1. 登录 GitHub → 右上角 **+** → **New repository**
   - 仓库名随意,例如 `portfolio`
   - 选 **Public**,点 **Create repository**
2. 在仓库页面点 **uploading an existing file**,把本文件夹里的所有文件拖进去上传,点 **Commit changes**
3. 仓库页面 → **Settings** → 左侧 **Pages**
   - Source 选 **Deploy from a branch**
   - Branch 选 **main**,文件夹选 **/(root)**,点 **Save**
4. 等 1–2 分钟,页面会显示你的网址:
   `https://你的用户名.github.io/portfolio/`

以后每次修改文件,推送后 1–2 分钟网站自动更新。

---

## 二、日常操作:加新照片

**例:给「余温」项目加一张照片**

1. 打开仓库 → 进入 `images/residual-heat/` 文件夹
2. 点 **Add file → Upload files**,上传照片(比如 `3.jpg`)→ Commit
3. 回到仓库根目录 → 打开 `data/config.json` → 点铅笔图标编辑
4. 找到对应项目,在 `images` 列表里加一行:

```json
"images": ["1.jpg", "2.jpg", "3.jpg"]
```

5. 点 **Commit changes**,等 1 分钟刷新网站即可

> 照片显示顺序 = 列表里的顺序,想调顺序直接改列表排列。
> 文件名建议用英文/数字,避免中文和空格(更稳定)。

---

## 三、日常操作:新建一个项目

1. 在 `images/` 下新建文件夹并上传照片(GitHub 上传时在文件名前输入 `images/新文件夹名/` 即可自动建文件夹)
2. 编辑 `data/config.json`,在某个分组的 `projects` 里照抄一段:

```json
{
  "id": "new-series",
  "title": "New Series 新系列",
  "description": "项目描述,\\n\\n 表示分段。",
  "folder": "images/new-series",
  "images": ["1.jpg", "2.jpg"]
}
```

> `id` 用英文小写,不能和其他项目重复(它会出现在网址里,如 `#new-series`)。
> 想加新的导航分组,照抄一段 `groups` 里的结构即可。

---

## 四、日常操作:改布局

编辑 `data/config.json` 顶部的 `layout`:

| 参数 | 作用 | 可选值 |
|---|---|---|
| `theme` | 明暗主题 | `"light"` / `"dark"` |
| `accentColor` | 导航选中色 | 任意色值,如 `"#c0392b"` |
| `imageMaxWidth` | 图片区最大宽度 | 数字(像素),如 `960`、`1200` |
| `columns` | 图片列数 | `1`(竖排大图)/ `2`(双列) |
| `imageGap` | 图片间距 | 数字(像素),如 `28` |
| `sidebarWidth` | 左侧导航宽度 | 数字(像素),如 `240` |
| `fontScale` | 全站字号缩放 | `1.0` 标准,`1.1` 放大 10% |

改完 Commit,刷新网站生效。想更深度改视觉风格才需要动 `css/style.css`。

---

## 五、改名字 / 简介 / 联系方式

都在 `data/config.json` 里:

- `site`:网站标题、中英文名、页脚
- `about`:简介标题、正文(`\n\n` 分段)、个人照片路径、电话邮箱

个人照片:把照片上传为 `images/portrait.jpg` 覆盖占位图即可。

---

## 六、常见问题

**改了 config.json 网站白屏?**
大概率是 JSON 格式错误——最常见的是列表最后一项后面多了逗号,或引号没配对。可以把整个文件贴给 Claude 帮你检查。

**双击 index.html 本地打不开?**
正常。浏览器拦截了本地文件读取,直接推到 GitHub 看效果,或用 VS Code 的 Live Server 插件本地预览。

**图片加载慢?**
上传前把照片压到长边 2000px 左右、单张 500KB 以内(可以用「智图」或 tinypng.com 批量压缩)。

**国内访问不稳定?**
GitHub Pages 在国内时好时坏。同一个仓库可以免费再部署到 Cloudflare Pages 或 Vercel(操作类似,连上仓库自动部署),速度会好很多;也可以绑定自己的域名。

**绑定自己的域名?**
Settings → Pages → Custom domain 填域名,再去域名服务商加一条 CNAME 记录指向 `你的用户名.github.io`。
