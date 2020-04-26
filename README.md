# CloudFlare Worker + github + vue 博客系统

[demo](https://blog.nds9.workers.dev)

[项目地址](https://github.com/sunyuting83/blog-cfw-github)

---
## 依赖
* [bulma](https://github.com/jgthms/bulma)
* [highlight](https://github.com/highlightjs/highlight.js)
* [Font-Awesome](https://github.com/FortAwesome/Font-Awesome)
* [core-js](https://github.com/zloirock/core-js)
* [vue](https://github.com/vuejs/vue)
* [vue-router](https://github.com/vuejs/vue-router)
* [markdown-it](https://github.com/markdown-it/markdown-it)
* [markdown-it-emoji](https://github.com/markdown-it/markdown-it-emoji)
* [CDN](https://www.staticfile.org/)
---

## 简介

基于Cloudflare worker + Githu + Vue的博客系统

免服务器

worker负责渲染html和读取github的静态文件

github负责储存静态文件、配置文件、博客文件

vue负责渲染页面

使用markdown-it解析渲染.md文件

***

#### worker路由

| Path | Description |
| ------ | ----------- |
| /   | 渲染html |
| /api/list | 请求列表api 参数 id=请求页面 page=当前分页 limit= 每页请求个数 |
| /{path}/{filename} | 静态文件 js、css、json |

***

#### 目录结构

| Path | Description |
| ------ | ----------- |
| /db   | 配置及索引json目录 |
| /db/config.json   | Blog配置文件。 json具体配置请查看 <a href="#configjson">config.json说明</a> |
| /db/index.json | 文章索引文件 json具体配置请查看 <a href="#indexjson">index.json说明</a> |
| /db/post.json | 文章列表 <a href="#postjson">post.json说明</a> |
| /post   | 文章目录 |
| /post/*.md   | 文章.md文件(支持html) |
| /blog.js   | vue渲染源码 |
| /index.html   | 首页静态文件-调试用 |
| /utils.js   | 工具合计-暂时没用 |
| /worker.js   | cloudflare worker主文件 |

---

## 使用
0. ##### Node.js 发布工具
+ 确认本地有nodejs环境。在项目目录下运行
```bash
node post.js
```
+ 之后根据提示操作

1. ##### fork 本项目
+ 修改worker.js 53行 改成你的worker.dev地址
+ 修改worker.js 108行 改成你的github账号名

2. ##### 编辑config.json
+ json具体配置请查看 <a href="#configjson">config.json说明</a>

3. ##### 在post目录下新建.md文件并编辑
+ 编辑 db/index.json 在[]内第一行插入
  - json具体配置请查看 <a href="#indexjson">index.json说明</a>
```json
{"key":"_分类id.1:2","value":".md文件名"}
```
+ 编辑 db/post.json 在[]内插入
  - json具体配置请查看 <a href="#postjson">post.json说明</a>
```json
{
    "title":"文章标题", 
    "id":"ebc8b15ab324f369",
    "content":"文章文件名(不需要.md)",
    "created_at": 1584172500549,
    "intro": "文章简介",
    "iscontent": false,
    "showhide": false
}
```
##### 以上id或文件名可以使用 utils.js生成


4. ##### 注册cloud flare并新建worker
+ 复制worker.js内容到worker并保存

5. ##### git push origin

---

## json文件说明

#### <a name="#config">config.json</a>

```json
{
  "status": 0,
  "title":"My Blog",
  "logo": "https://cdn.jsdelivr.net/gh/vmlite/static/bulma/images/bulma-type.png",
  "powered": "Powered by Sun &copy; 2020",
  "icp": "沪ICP备18008848号-1",
  "classify": [
    {
      "title":"Linux", 
      "id":"d8a7613e9c1d8c08",
      "path": "linux",
      "sort": 0,
      "intro": ""
    }
  ]
}
```

```status:0``` 请求状态

```title:博客标题```

```logo:博客logo url```

```powered:版权信息```

```icp:备案信息```

```classify:分类列表```

##### <a name="#classify">classify说明：</a> 

```title:分类名称```

```id:分类id``` 由当前时间戳md5加密生成

```path: vue路由路径```

```sort:排序``` 暂时无效

```intro:文章简介```

***

#### <a name="#index">index.json</a>

```json
[
  {"key":"_b7bf1bb083c178dc.1:2","value":"ebc8b15ab324f369"},
  {"key":"_d8a7613e9c1d8c08.1:1","value":"5b5f57943586f02f"}
]
```

```key:_分类id.该分类下索引数:文章总索引数```

```value:文章id```

最新的文章请添加到首行，分页采取index方式获取列表

key的 .  后面每次 +1 , : 后面每次 +1 保证key的唯一性

value的值对应 post.json 里文章id

***

#### <a name="#post">post.json</a>

```json
[
  {
    "title":"测试文章2", 
    "id":"5b5f57943586f02f",
    "content":"6f8329eb9b358e92",
    "created_at": 1584172505060,
    "intro": "somecode",
    "iscontent": false,
    "showhide": false
  }
]
```

```title:文章标题```

```id:文章id``` (生成规则同classify)

```content:文章内容文件名``` (不包含.md)

```created_at:创建时间```

```intro:文章简介```

```iscontent:用于判断显示[intro/content]```

```showhide:用于判断[展开/收起]```

~~```newcontent:文章标题``` 请求后由vue渲染生成 无需添加至json文件~~

文章id对应 index.json -> value值

---

## 计划

1. 添加tag功能
2. 评论功能(找个公共评论插件)
3. 添加自动提交功能(本地js、python命令行，自动生成.md文件名，自动添加index.js post.js 自动提交)
4. 通过github api制作在线post文章功能
5. 搜索功能