const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const axios = require('axios');

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index2.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

//公众号信息
const appid = 'wxccd60360b70c2d6e';
const secret= '7f67eaa5e7eb55f62cfdd3264e97bce7';

//缓存access_token
let access_token_cache
//缓存ticket
let ticket_cache


let access_token = '';
let ticket = ""


async function getAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
  const res = await axios.get(url);
  console.log('res:', res.data);
  res.data.expires_in = Date.now() + res.data.expires_in * 1000
  access_token_cache = res.data
  return res
}

async function getTicket() {
  if (access_token_cache && access_token_cache.expires_in > Date.now()) {
    access_token = access_token_cache.access_token
  } else {
    let res = await getAccessToken()
    access_token = res.data.access_token
  }
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`;
  const res = await axios.get(url);
  console.log('res:', res.data);
  res.data.expires_in = Date.now() + res.data.expires_in * 1000
  ticket_cache = res.data
  return res
}


// 获取access_token
router.get('/api/getAccessToken', async ctx => {
  let res = await getAccessToken()
  ctx.body = res.data;
})


//获取ticket
router.get('/api/getticket', async ctx => {
  let res = await getTicket()
  ctx.body = res.data;
})


//获取signature
router.get('/api/getsignature', async ctx => {
  console.log('ctx.request.query: ',  ctx.request.query)
  let url = ctx.request.query.url
  if (ticket_cache && ticket_cache.expires_in > Date.now()) {
    ticket = ticket_cache.ticket
  }else {
    let res = await getTicket()
    ticket = res.data.ticket
  }
  let nonceStr = Math.random().toString(36).substr(2, 15)
  let timestamp = parseInt(new Date().getTime() / 1000) + ''
  let str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
  let signature = require('crypto').createHash('sha1').update(str).digest('hex')
  let data = {
    appId: appid,
    timestamp,
    nonceStr,
    signature
  }
  ctx.body = data
})

// 微信Token验证
router.get("/api/wx", async (ctx) => {
  // const { signature, timestamp, nonce, echostr } = ctx.request.query;
  // const token = '123456';
  // const arr = [token, timestamp, nonce].sort();
  // const str = arr.join("");
  // const sha1 = require("sha1");
  // const sha1Str = sha1(str);
  // if (sha1Str === signature) {
  //   ctx.body = true;
  // }else {
  //   ctx.body = true
  // }
  ctx.body = true
});

// 小程序调用，获取微信 Open ID
// router.get("/api/wx_openid", async (ctx) => {
//   if (ctx.request.headers["x-wx-source"]) {
//     ctx.body = ctx.request.headers["x-wx-openid"];
//   }
// });

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  // await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
