function Fetch(url = '', data = {}, type = 'GET', text = false) {
  type = type.toUpperCase()
  // 此处规定get请求的参数使用时放在data中，如同post请求
  if (type === 'GET') {
    let dataStr = ''
    Object.keys(data).forEach(key => {
      dataStr += key + '=' + data[key] + '&'
    })

    if (dataStr !== '') {
      dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'))
      url = url + '?' + dataStr
    }
  }

  let requestConfig = {
    // fetch默认不会带cookie，需要添加配置项credentials允许携带cookie
    method: type,
    headers: {
      'Content-type':'application/json;charset=UTF-8'
    }
  }

  if (type === 'POST') {
    Object.defineProperty(requestConfig, 'body', {
      value: JSON.stringify(data)
    })
  }
  return new Promise((resolve) => {
    fetch(url, requestConfig)
      .then(res => {
        if(res.ok) {
          if(text) {
            resolve(res.text())
          }else{
            resolve(res.json())
          }
        }else {
          resolve({
            status: 1,
            message: res.status
          })
        }
      })
      .catch((err) => {
        resolve({
          status: 0,
          message: err.message
        })
      })
  })
}
let Template = {}
/** Menu Template
 * @param {Array} menuData 分类列表
 * @param {String} thisPath 当前分类path
 * @param {String} logoPath Logo url
 * @param {Boolean} menuActive 是否选中
 * @param {Function} setMenuActive 设置菜单行为
 */
Template.Menu = `
<nav class="bd-navbar navbar has-shadow is-white">
  <div class="container">
  <div class="navbar-brand">
    <li class="navbar-item">
      <img :src="logoPath" alt="Bulma" style="height:15px">
    </li>

    <div id="navbarBurger" class="navbar-burger burger" @click="setMenuActive" :class="menuActive?'is-active':''">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>

  <div class="navbar-menu" :class="menuActive?'is-active':''">
    <div class="navbar-start">
      <router-link 
        to="/" 
        class="navbar-item bd-navbar-item-documentation"
        :class="thisPath == 'index'?'is-active':''">
        <span>Home</span>
      </router-link>
      <router-link 
        class="navbar-item bd-navbar-item-expo " 
        v-for="(item,index) in menuData" 
        :key="index" 
        :to="'/list/'+item.path"
        :class="thisPath == item.path?'is-active':''">
        <span>{{item.title}}</span>
      </router-link>
    </div>
  </div>
  </div>
</nav>
`
/** Pagination Template
 * @param {Number} countN 总数
 * @param {String} currentPage 当前页
 * @param {Number} thisPath 当前分类path
 * @param {Number} limit Limit
 */
Template.Pagination = `
<nav v-if="countN > limit" class="pagination is-small" role="navigation" aria-label="pagination">
  <router-link 
    :to="current_page <= 1?'':'/list/'+thisPath+'/'+(Number(current_page) - 1)"
    class="pagination-previous" 
    :disabled="current_page <= 1" 
    >
    上一页
  </router-link>
  <router-link 
    :to="current_page == Math.ceil(countN / limit)?'':'/list/'+thisPath+'/'+(Number(current_page) + 1)"
    class="pagination-next" 
    :disabled="current_page >= Math.ceil(countN / limit)">
    下一页
  </router-link>
  <ul class="pagination-list">
    <li v-for="i in Math.ceil(countN / limit)" :key="i">
      <router-link 
        :to="'/list/'+thisPath+'/'+i" 
        class="pagination-link" 
        :aria-label="'Goto page '+i" 
        :class="i == current_page?'is-current':''">
        {{i}}
      </router-link>
    </li>
  </ul>
</nav>
`
/** List Template
 * @param {Array} menuData 分类列表
 * @param {Object} postList 文章列表
 * @param {Number} countN 总数
 * @param {String} currentPage 当前页
 * @param {Number} thisPath 当前分类path
 * @param {Number} limit Limit
 * @param {Function} getContent 获取文章内容
 * @param {Boolean} showhide 展开 收起
 */
Template.List = `
<div>
  <div class="container" v-if="postList.status == 0">
    <div class="tile">
      <div class="tile is-vertical is-parent" v-if="postList.list.length > 0">
        <div class="box" v-for="(item,index) in postList.list" :key="index">
          <div class="media">
            <div class="media-content">
              <div class="content">
                <div class="columns is-mobile" @click="getContent(item.content, index)">
                  <div class="column is-three-quarters">
                    <strong class="is-size-4">{{item.title}}</strong>
                  </div>
                  <div class="column has-text-right">
                    <span>{{item.showhide?'收起':'展开'}}</span>
                    <span class="icon has-text-info">
                      <i class="fas" :class="item.showhide?'fa-angle-double-up':'fa-angle-double-down'"></i>
                    </span>
                  </div>
                </div>
                <p v-if="!item.iscontent">{{item.intro}}</p>
                <p v-else v-html="item.newcontent"></p>
                <div class="columns is-mobile" @click="getContent(item.content, index)">
                  <div class="column is-three-quarters">
                    <span class="is-size-7 has-text-grey-light is-family-monospace">发布于： {{item.created_at | formatTime('yyyy-MM-dd h:m')}}</span>
                  </div>
                  <div class="column has-text-right" v-if="item.showhide">
                    <span>{{item.showhide?'收起':'展开'}}</span>
                    <span class="icon has-text-info">
                      <i class="fas" :class="item.showhide?'fa-angle-double-up':'fa-angle-double-down'"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tile is-vertical is-parent" v-else>
        <div class="box">
          <div class="media">
          <div class="media-content">
            <div class="content  has-text-centered">
              <img class="image" src="https://s1.ax1x.com/2020/03/15/81FAPA.png" />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tile">
      <Pagination
        :count-n="countN" 
        :current-page="currentPage"
        :this-path="thisPath" />
    </div>
  </div>
  <div class="container" v-else>
    <div class="tile">
      <div class="tile is-vertical is-parent">
        <div class="box">
          <div class="media">
            <div class="media-content">
              <div class="content" style="text-align: center;">
                <span class="icon has-text-black-bis">
                  <i class="fas fa-3x fa-spinner fa-pulse"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`
/** Footer Template
 * @param {String} icpIs 备案号
 * @param {String} poweredBy 版权
 */
Template.Footer = `
<footer class="footer">
<div class="content has-text-centered">
<p>
  <strong v-html="poweredBy"></strong>. <a v-if="icpIs.length > 0" href="http://beian.miit.gov.cn/" target="_blank">{{icpIs}}</a>
</p>
</div>
</footer>
`
/** NotFound Template
 */
Template.NotFound = `<p>Page not found</p>`

/** PublicList Template
 * @param {Array} menulist 分类列表
 * @param {String} path 当前页path
 * @param {String} logo Logo url
 * @param {Array} list 文章列表
 * @param {Number} count 文章总数
 * @param {Number} current_page 当前页
 * @param {String} icp 备案号
 * @param {String} powered 版权信息
 * @param {Boolean} status 状态
 */
Template.PublicList = `
<div>
  <div v-if="status == 0">
    <Menu :menu-data="menulist" :this-path="path" :logo-path="logo" />
    <List
      :post-list="list" 
      :count-n="count"
      :this-path="path"
      :current-page="current_page" />
    <Footer :icp-is="icp" :powered-by="powered" />
  </div>
  <div v-else class="container">
  <section class="hero">
    <div class="hero-body">
      <div class="container" style="text-align: center">
        <span class="icon has-text-black-bis">
          <i class="fas fa-3x fa-spinner fa-pulse"></i>
        </span>
      </div>
    </div>
  </section>
</div>
`

//** --------------------------------华丽的分割符-------------------------------------------- */

// NotFound
const NotFound = {template: Template.NotFound}

// Menu
const Menu = {
  template: Template.Menu,
  props: ['menuData', 'thisPath', 'logoPath'],
  data() {
    return {
      menuActive: false
    }
  },
  methods: {
    setMenuActive() {
      this.menuActive = !this.menuActive
    }
  }
}

// Pagination
const Pagination = {
  props: ['countN', 'currentPage', 'thisPath'],
  data(){
    return {
      limit: 4,
      current_page: this.currentPage
    }
  },
  template: Template.Pagination,
  watch: {
    currentPage(n) {
      if(n !== this.current_page) this.current_page = n
    }
  }
}

// List
const List = {
  props: ['postList','countN', 'currentPage', 'thisPath'],
  components:{
    Pagination
  },
  template: Template.List,
  data(){
    return{
      md: function(){}
    }
  },
  created(){
    const md = window.markdownit({
      html: true,
      breaks: false,
      langPrefix: 'language-',
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value;
          } catch (__) {}
        }
    
        return ''; // use external default escaping
      }
    }).use(window.markdownitEmoji)
    this.md = md
  },
  methods: {
    async getContent(id, i){
      const url = `https://blog.nds9.workers.dev/post/?id=${id}`
      const data = await Fetch(url,{},'GET',text=true)
      this.postList.list[i].iscontent = !this.postList.list[i].iscontent
      this.postList.list[i].newcontent = this.md.render(data)
      this.postList.list[i].showhide = !this.postList.list[i].showhide
    }
  },
  filters: {
    formatTime: function (date, fmt) {
      var date = new Date(date)
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
      }
      for (var k in o) {
        if (new RegExp('('+k+')').test(fmt)) {
          var str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length))
        }
      }
      return fmt;
    }
  }
}

// Footer
const Footer = {
  props: ['icpIs', 'poweredBy'],
  template: Template.Footer
}

// PublicList
const PublicList = {
  components:{
    Menu,
    List,
    Footer
  },
  template: Template.PublicList,
    data() {
      return {
        path: '',
        status: 3,
        menulist: [],
        list: {
          status: 3,
          list:[]
        },
        count: 0,
        current_page: 1,
        logo: '',
        powered: '',
        icp: ''
      }
    },
    async created() {
      const config = await Fetch('https://blog.nds9.workers.dev/config')
      if(config.status == 0) {
        this.status = config.status
        this.menulist = config.classify
        this.logo = config.logo
        this.powered = config.powered
        this.icp = config.icp
        document.title = config.title
      }
      this.getPath()
    },
    methods: {
      getPath(){
        const _this = this
        this.list.status = 3
        const current_page = this.$route.params.page
        this.current_page = current_page
        if(current_page == undefined) this.current_page = 1
        this.path = this.$route.params.path
        if(this.path == undefined) this.path = 'index'
        const classify = this.menulist.filter(x => x.path == _this.path)[0]
        if(classify) {
          this.getList(classify.id,this.current_page)
        }else{
          this.getList('index',this.current_page)
        }
      },
      async getList(id, page = 0, limit = 4) {
        let j = await Fetch(`https://blog.nds9.workers.dev/list?id=${id}&page=${page}&limit=${limit}`)
        this.list = j
        // console.log(array)
        this.count = Number(j.count)
      }
    },
    watch: {
      '$route':'getPath'
    }
}
const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: PublicList
    },
    {
      path: '/list/:path',
      name: 'list',
      component: PublicList
    },
    {
      path: '/list/:path/:page',
      name: 'list',
      component: PublicList
    },
    {
      path: '*',
      component: NotFound
    }
  ],
  linkExactActiveClass: 'is-active'
})
var app = new Vue({
  el: '#app',
  router
});