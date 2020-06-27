const readline = require('readline'),
      path = require('path'),
      fs = require('fs'),
      {spawnSync, execSync} = require('child_process'),
      config = require('./db/config.json'),
      post = require('./db/post.json'),
      blog_index = require('./db/index.json'),
      crypto = require('crypto')


const logo = `\x1B[32m
  ╔═╗╔═╗╦ ╦  ╔╗ ╦  ╔═╗╔═╗
  ║  ╠╣ ║║║  ╠╩╗║  ║ ║║ ╦
  ╚═╝╚  ╚╩╝  ╚═╝╩═╝╚═╝╚═╝
\x1B[0m`
const welcome = `${logo}
-------------------------------
\x1B[33m1 修改资料
2 添加分类
3 管理分类
4 添加文章
5 修改文章
6 打印菜单
7 提交更改
8 退出\x1B[0m
-------------------------------
`

class Manage {
  constructor(props) {
    this.data = {
      welcome: welcome,
      rootpath: path.join(__dirname, 'db')
    }
  }

  async init(){
    // const git = await execSync('git pull origin')
    // console.log(git)
    console.log(this.data.welcome)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '请选择 [1-7] > '
    })
    rl.prompt()
    rl.on('line', (line) => {
      this.oneMenu(line.trim(), rl)
      rl.prompt()
    }).on('close', () => {
      console.log('再见!')
      process.exit(0)
    })
  }

  // 检测输入是否是数字
  checkType(str) {
    if(str.length < 0) return false
    str = parseInt(str)
    var regPos = /^\d+(\.\d+)?$/ //非负浮点数
    if(regPos.test(str)){
      return true
    }else{
      return false
    }
  }

  makeMD5 = (str) => {
    var md5 = crypto.createHash('md5');
    let s = md5.update(str);
    s = md5.digest('hex');
    return s;
  }

  makeID = () => {
    const n = Date.now()
    let x = this.makeMD5(String(n))
    x = x.substr(0, 16)
    return x
  }

  // 主菜单
  oneMenu(str, rl){
    if(this.checkType(str)) {
      switch (str) {
        case '1':
          this.modifyInfo(rl)
          break
        case '2':
          this.addClassify(rl)
          break
        case '3':
          console.log('管理分类!')
          break
        case '4':
          this.addBLog(rl)
          break
        case '5':
          console.log('修改文章!')
          break
        case '6':
          console.log(welcome)
          break
        case '7':
          this.getPush()
          break
        case '8':
          console.log('再见!')
          rl.close()
          break
        default:
          console.log('\x1B[31m无效的选项\x1B[0m')
          break
      }
    }else {
      console.log('\x1B[31m请输入数字\x1B[0m')
    }
  }

  // 修改资料
  modifyInfo(rl) {
    let newConfig = config
    const start = () => {
      rl.question('\x1B[31m请输入博客名称[不修改请回车] > \x1B[0m',(name)=>{
        if(name.length > 0) {
          newConfig.title = name
          logo()
        }else{
          logo()
        }
      })
    }
    const logo = () => {
      console.log('推荐图床 => https://img.rruu.net/')
      rl.question('\x1B[31m请输入Logo Url[不修改请回车] > \x1B[0m',(name)=>{
        if(name.length > 0) {
          newConfig.logo = name
          powered()
        }else{
          powered()
        }
      })
    }
    const powered = () => {
      console.log('版权示例：Powered by Sun &copy; 2020')
      rl.question('\x1B[31m请输入版权信息[不修改请回车] > \x1B[0m',(name)=>{
        if(name.length > 0) {
          newConfig.powered = name
          icp()
        }else{
          icp()
        }
      })
    }
    const icp = () => {
      console.log('icp信息可以为空')
      rl.question('\x1B[31m请输入icp[不修改请回车] > \x1B[0m',(name)=>{
        if(name.length > 0) {
          newConfig.icp = name
          end()
        }else{
          end()
        }
      })
    }
    const end =() => {
      const jsonpath = path.join(this.data.rootpath, 'config.json')
      newConfig = JSON.stringify(newConfig,"","\t")
      fs.writeFileSync(jsonpath,newConfig)
      console.log('\x1B[31m修改成功\x1B[0m')
      console.log(this.data.welcome)
      rl.question('请选择 [1-7] > ',(str)=>{
        this.oneMenu(str, rl)
      })
    }
    start()
  }

  // 添加分类
  addClassify(rl){
    const _this = this
    const classify = config.classify
    const addpath = () => { //添加路径函数
      rl.question('\x1B[31m请输入分类路径 > \x1B[0m',(newpath)=>{
        if(newpath.length > 0) {
          // 通过filter判断数组中是否已存在path
          const check = classify.filter(x => x.path == newpath)
          if(check.length > 0) {
            // 存在。启动addpath函数重新输入
            console.log('路径已存在')
            addpath()
          }else{
            // 不存在 设置data.classpath
            _this.data.classpath = newpath
            // 这里写个保存json函数
            console.log(`路径 > ${newpath}`)
            const jsonpath = path.join(this.data.rootpath, 'config.json')
            const id = this.makeID()
            const newClassify = {
              "title": _this.data.classify, 
              "id": id,
              "path": newpath,
              "sort": classify.length,
              "intro": ""
            }
            let newConfig = config
            newConfig.classify = [...newConfig.classify, newClassify]
            newConfig = JSON.stringify(newConfig,"","\t")
            fs.writeFileSync(jsonpath,newConfig)
            console.log('\x1B[31m添加成功\x1B[0m')
            console.log(this.data.welcome)
            rl.write('请选择 [1-7] > ')
          }
        }else {
          console.log('路径不能为空')
          addpath()
        }
      })
    }
    const addclass = () => {  //添加分类名称函数
      rl.question('\x1B[31m请输入分类名 > \x1B[0m',(title)=>{
        // 通过filter判断数组中是否已存在分类名
        if(title.length > 0) {
          const check = classify.filter(x => x.title == title)
          if(check.length > 0) {
            // 存在。启动addclass函数重新输入
            console.log('分类已存在')
            addclass()
          }else {
            // 不存在 设置data.classify 启动addpath函数
            _this.data.classify = title
            console.log(`分类名 > ${title}`)
            addpath()
          }
        }else{
          console.log('分类名不能为空')
          addclass()
        }
      })
    }
    addclass()
  }

  // add Blog
  addBLog(rl){
    const editormd = path.join(__dirname, 'editormd.html')
    let classify = config.classify
    let classifyname = classify.map((x, i) => {
        x = i + ' ' +x.title
        return x
    })
    classifyname = classifyname.join('\n')
    const cl = classify.length - 1
    const menu = `\x1B[32m请选择分类\x1B
    -------------------------------
    \x1B[33m${classifyname}\x1B[0m
    -------------------------------
    `
    const openDefaultBrowser = (url) => {
      switch (process.platform) {
        case "darwin":
          spawnSync('open ' + url)
          break
        case "win32":
          spawnSync('start ' + url)
          break
        default:
          spawnSync('xdg-open', [url])
          break
      }
    }
    
    const switchClassify =() =>{
      console.log(menu)
      rl.question(`\x1B[31m请选择分类 0-${cl} > \x1B[0m`,(typeing)=>{
        if(this.checkType(typeing) && typeing !== '') {
          if(parseInt(typeing) >= 0 && parseInt(typeing) <= cl) {
            this.data.blogClassify = `_${classify[parseInt(typeing)].id}`
            inpuTitle()
          }else {
            console.log('请正确选择分类号')
            switchClassify()
          }
        }else{
          console.log('请正确输入')
          switchClassify()
        }
      })
    }
    // 输入title
    const inpuTitle = () => {
      rl.question(`\x1B[31m请输入标题 \x1B[0m`,(title)=>{
        if(title.length > 0) {
          this.data.blogTitle = title
          this.data.blogId = this.makeID()
          intro()
        }else{
          console.log('标题不能为空')
          inpuTitle()
        }
      })
    }
    // 输入intro
    const intro = () => {
      rl.question(`\x1B[31m请输入简介 \x1B[0m`,(intro)=>{
        if(intro.length > 0) {
          this.data.blogIntro = intro
          makeFile()
        }else{
          console.log('简介不能为空')
          intro()
        }
      })
    }
    const makeFile =() => {
      let newpost = post,
          newindex = blog_index
      const 
        postpath = path.join(this.data.rootpath, 'post.json'),
        indexpath = path.join(this.data.rootpath, 'index.json'),
        id = this.makeID(),
        filepath = path.join(__dirname, `post/${id}.md`),
        blog = {
          "title": this.data.blogTitle, 
          "id": this.data.blogId,
          "content": id,
          "created_at": Date.now(),
          "intro": this.data.blogIntro,
          "iscontent": false,
          "showhide": false,
          "status": 3
        },
        index = {
          "key":this.data.blogClassify,"value":this.data.blogId
        }
      fs.writeFileSync(filepath,'')
      openDefaultBrowser(editormd) //打开浏览器editor.md
      newpost = [...post, blog]
      newpost = JSON.stringify(newpost,"","\t")
      fs.writeFileSync(postpath,newpost)

      newindex = [...newindex, index]
      newindex = JSON.stringify(newindex,"","\t")
      fs.writeFileSync(indexpath,newindex)
      console.log('\x1B[31m添加成功\x1B[0m')
      console.log(this.data.welcome)
      rl.write('请选择 [1-7] > ')
    }
    switchClassify()
  }

  // git push origin
  getPush(){
    let pull = execSync('git status')
    pull = pull.toString()
    if(pull.includes('git add')) {
      console.log('Please waiting...')
      execSync('git add -A')
      execSync('git commit -m "new post"')
      execSync('git push')
      console.log('提交成功')
    }else {
      console.log('没有任何修改，无需提交')
    }
  }
}

const start = new Manage()
start.init()