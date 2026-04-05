# 使用说明

本页面已精简为论文展示的最小结构，目前仅保留以下区域：
- 标题 + 作者 + 机构 + 链接
- Abstract
- Footer

## 编辑内容
- 在 index.html 中更新标题与作者信息。
- 将 Abstract 段落替换为你的论文摘要。
- 把 Paper、arXiv、Video、Code、Data 的链接改为你的地址。

## 保留的 CSS
文件：static/css/index.css
- 标题与作者的字体排版
- 链接按钮间距与页脚图标大小

需要更多样式时，继续在这个文件里添加即可。

## 保留的 JS
文件：static/js/index.js
- 仅保留移动端导航栏的展开/收起逻辑

如果你后续加入交互功能，可以把脚本写在这个文件里。

## 图片资源
请把图片放到 static/images，并使用相对路径引用。
示例：
- ./static/images/your_figure.jpg
- ./static/images/diagram.png

当前保留的资源：
- static/images/favicon.svg
- static/images/interpolate_start.jpg
- static/images/interpolate_end.jpg

## static/ 里保留的库文件
这些库文件已保留，但 index.html 里不再加载：
- static/css/bulma.min.css
- static/css/fontawesome.all.min.css
- static/js/fontawesome.all.min.js
- static/css/bulma-carousel.min.css
- static/js/bulma-carousel.min.js
- static/css/bulma-slider.min.css
- static/js/bulma-slider.min.js

如果你需要它们，重新在 index.html 中加入对应的 <link> 或 <script> 标签即可。

## GitHub Pages
index.html 目前全部使用相对路径（如 ./static/...），适用于仓库根目录部署。

如果部署到子目录，请继续使用相对路径，或设置正确的 base URL。
