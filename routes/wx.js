var express = require('express');
var router = express.Router();
var Wechat = require('../wechat/wechat');
var config = require('../config/wxConfig');//引入配置文件

var wechatApp = new Wechat(config); //实例wechat 模块
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//用于处理所有进入 3000 端口 get 的连接请求
router.use('/auth', function (req, res) {
    wechatApp.auth(req, res);
});

router.get('/getAccessToken', function (req, res) {
    wechatApp.getAccessToken(req, res)
});
module.exports = router;
