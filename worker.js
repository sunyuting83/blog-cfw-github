function handleOptions(request) {
  // Make sure the necesssary headers are present
  // for this to be a valid pre-flight request
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check the requested method + headers
    // you can do that here.
    return new Response(null, {
      headers: corsHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    })
  }
}
async function handleRequest(request) {
  let url = new URL(request.url)
  if(url.pathname.startsWith('/api')) {
    let init = {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    }
    let data = '404'
    const path = url.pathname.split('/')[2]
    const {id, page, limit} = get_query(request.url)
    switch (path) {
      case 'list':
        init.headers = {'content-type': 'application/json;charset=UTF-8'}
        data = await getList(id, Number(page), Number(limit))
        break
      case 'post':
        data = await getPost(id)
        break
      case 'config':
        init.headers = {'content-type': 'application/json;charset=UTF-8'}
        const newrequest = {
          url: 'https://raw.githubusercontent.com/db/config.json'
        }
        data = await getStatic(newrequest, true)
        break
      default:
        break
    }
    // return new Response(data, init)
    let response = new Response(data, init)
    // Recreate the response so we can modify the headers
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    // Append to/Add Vary header so browser will cache response correctly
    response.headers.append('Vary', 'Origin')
    return response
  }else {
    return await getStatic(request)
  }
}
addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (url.pathname.startsWith(proxyEndpoint)) {
    if (request.method === 'OPTIONS') {
      // Handle CORS preflight requests
      event.respondWith(handleOptions(request))
    } else if (
      request.method === 'GET' ||
      request.method === 'HEAD' ||
      request.method === 'POST'
    ) {
      // Handle requests to the API server
      event.respondWith(handleRequest(request))
    } else {
      event.respondWith(async () => {
        return new Response(null, {
          status: 405,
          statusText: 'Method Not Allowed',
        })
      })
    }
  } else {
    // Serve demo page
    event.respondWith(handleRequest(event.request))
  }
})
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Expose-Headers': 'Captcha',
  "Access-Control-Allow-Credentials": true
}
const proxyEndpoint = '/api/'

function get_query(url) {
  var theRequest = new Object();
  if (url.includes("?")) {
    var str = url.substr(url.lastIndexOf('?')+1);
    strs = str.split("&");
    for(var i = 0; i < strs.length; i ++) {
      theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
    }
  }
  return theRequest;
}

async function getList(id, page = 0, limit = 4) {
  const request = {
    url: 'https://raw.githubusercontent.com/db/index.json'
  }
  let j = JSON.parse(await getStatic(request, true))
  if(page <= 0) page = 1;
  page = page - 1;
  let start = (page * limit),
      offset = (start + limit) - 1
  let list = []
  let count = 0
  if(id === 'index') {
    count = j.length
    j.filter((x,i) => {
      if(i >= start && i <= offset) list = [...list, x.value]
    })
  }else {
    // console.log(id)
    let obj_keys = new Set(j.filter(s => s.key.includes(`_${id}`)))
    obj_keys = Array.from(obj_keys)
    count = obj_keys.length
    obj_keys.filter((x,i) => {
      if(i >= start && i <= offset) list = [...list, x.value]
    })
  }
  const p = {
    url: 'https://raw.githubusercontent.com/db/post.json'
  }
  let d = JSON.parse(await getStatic(p, true))
  let a = new Set(d)
  let b = new Set(list)
  let e = new Set([...a].filter(x => b.has(x.id)))
  let json = {
    status: 0,
    list: Array.from(e),
    count: Number(count)
  }
  return JSON.stringify(json)
}

async function getPost(id) {
  const request = {
    url: `https://raw.githubusercontent.com/post/${id}.md`
  }
  return await getStatic(request, true)
}

async function getStatic(request, static=false) {
  let init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }
  let data = someHTML
  const jsHeaders = {'content-type':'application/javascript;charset=UTF-8'}
  const jsonHeaders = {'content-type':'application/json;charset=UTF-8'}
  const cssHeaders = {'content-type':'text/css;charset=UTF-8'}
  const github = 'sunyuting83',
        repository = 'blog-cfw-github'
  let url = new URL(request.url)
  url.hostname = "raw.githubusercontent.com"
  const newpath = `/${github}/${repository}/master${url.pathname}`
  const tp = url.pathname.substring(url.pathname.lastIndexOf('.') +1, url.pathname.length)
  url.pathname = newpath
  switch (tp) {
    case 'js':
      init.headers = jsHeaders
      data = await FetchStatic(url)
      break
    case 'json':
      init.headers = jsonHeaders
      data = JSON.stringify(await FetchStatic(url, true))
      break
    case 'css':
      init.headers = cssHeaders
      data = await FetchStatic(url)
      break
    case 'md':
      data = await FetchStatic(url)
      break
    default:
      break
  }
  if(static) {
    return data
  }else {
    return new Response(data, init)
  }
}

async function FetchStatic(url, type = false) {
  const headers = {
    'Referer': 'https://raw.githubusercontent.com/',
    'User-Agent': 'Cloudflare Workers'
  }
  let data = await fetch(url,{
    "method": "GET",
    "headers": headers
  })
  if(data.ok) {
    if(type) {
      data = await data.json()
    }else {
      data = await data.text()
    }
    return data
  }
  return data.status
}

const someHTML =  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="https://cdn.staticfile.org/bulma/0.8.0/css/bulma.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.staticfile.org/highlight.js/9.18.1/styles/atom-one-light.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.staticfile.org/font-awesome/5.12.1/css/all.min.css">
    <style>
      .footer {
        padding:.85rem 0;
        margin-top: 1rem;
      }
      .pagination {
        margin-top: 1rem;
      }
      .pagination-link.is-current {
        background-color: #333;
        border-color: #333;
        color: #fff;
      }
      .image {
        display: inline-block;
        max-width: 20%;
      }
    </style>
    <title>loading...</title>
  </head>
  <body>
    <div id="app">
      <router-view />
    </div>
    <script src="https://cdn.staticfile.org/core-js/2.6.9/core.min.js"></script>
    <script src="https://cdn.bootcss.com/vue/2.6.11/vue.min.js"></script>
    <script src="https://cdn.staticfile.org/vue-router/3.1.3/vue-router.min.js"></script>
    <script src="https://cdn.staticfile.org/highlight.js/9.18.1/highlight.min.js"></script>
    <script src="https://cdn.staticfile.org/markdown-it/10.0.0/markdown-it.min.js"></script>
    <script src="https://cdn.staticfile.org/markdown-it-emoji/1.4.0/markdown-it-emoji-light.min.js"></script>
    <script src="/blog.js"></script>
  </body>
</html>
`