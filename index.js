const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const axios = require('axios');
// const { init: initDB, Counter } = require("./db");

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index2.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

// 更新计数
// router.post("/api/count", async (ctx) => {
//   const { request } = ctx;
//   const { action } = request.body;
//   if (action === "inc") {
//     await Counter.create();
//   } else if (action === "clear") {
//     await Counter.destroy({
//       truncate: true,
//     });
//   }

//   ctx.body = {
//     code: 0,
//     data: await Counter.count(),
//   };
// });

// 获取计数
// router.get("/api/count", async (ctx) => {
//   const result = await Counter.count();

//   ctx.body = {
//     code: 0,
//     data: result,
//   };
// });

const appid = 'wxee7cc95fe91f313d';
const secret= '7434c4a94831fb63edd240ec4561306f';

// 获取access_token
router.get('/api/getAccessToken', async ctx => {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
  const res = await axios.get(url);
  console.log('res:', res.data);
  ctx.body = res.data;
})

let access_token = '86_I8vwa5h1yQvXOZ3wmP5IBrCasecZUJEAqdMI8XZi3EatejkuZdnZWLECez4hVaTPgdRsQkBegisBErbwWWFSL_LPMZStMYlx50y44wyVvS4Goqe24ad0CsrU36ENWIiAJAQZL';
//获取ticket
router.get('/api/getticket', async ctx => {
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`;
  const res = await axios.get(url);
  console.log('res:', res.data);
  ctx.body = res.data;
})

let ticket = "O3SMpm8bG7kJnF36aXbe8677cbpy9gdG-2GA-6UtGsJ1K1iB7MdBv1uwWlGxKo6NrFd_Gb6_aXEz5a6BREysuQ"
//获取signature
router.get('/api/getsignature', async ctx => {
  console.log('ctx.request.query: ',  ctx.request.query)
  let url = ctx.request.query.url
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
