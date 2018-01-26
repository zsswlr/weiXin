'use strict' //设置为严格模式

const crypto = require('crypto'), //引入加密模块
    https = require('https'), //引入 htts 模块
    util = require('util'), //引入 util 工具包
    fs = require('fs'),
    path = require('path'),
    accessTokenJson = require('../config/access_token'); //引入本地存储的 access_token


//构建 WeChat 对象 即 js中 函数就是对象
var WeChat = function (config) {
    //设置 WeChat 对象属性 config
    this.config = config;
    //设置 WeChat 对象属性 token
    this.token = config.token;
    //设置 WeChat 对象属性 appID
    this.appID = config.appID;
    //设置 WeChat 对象属性 appScrect
    this.appScrect = config.appScrect;
    //设置 WeChat 对象属性 apiDomain
    this.apiDomain = config.apiDomain;
    //设置 WeChat 对象属性 apiURL
    this.apiURL = config.apiURL;
}


/**
 * 微信接入验证
 */
WeChat.prototype.auth = function (req, res) {
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
    var signature = req.query.signature,//微信加密签名
        timestamp = req.query.timestamp,//时间戳
        nonce = req.query.nonce,//随机数
        echostr = req.query.echostr;//随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    var array = [this.token, timestamp, nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    var tempStr = array.join('');
    const hashCode = crypto.createHash('sha1'); //创建加密类型
    var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (resultCode === signature) {
        res.send(echostr);
    } else {
        res.send('mismatch');
    }
}


/**
 * 获取微信 access_token
 */
WeChat.prototype.getAccessToken = function () {
    var that = this;
    //获取当前时间
    var currentTime = new Date().getTime();
    //格式化请求地址
    var url = util.format(that.apiURL.accessTokenApi, that.apiDomain, that.appID, that.appScrect);
    console.log(accessTokenJson)
    if (accessTokenJson.access_token === "" || accessTokenJson.expires_time < currentTime) {

        https.get(url, (res) => {
            console.log('statusCode:', res.statusCode);
            // console.log('headers:', res.headers);

            res.on('data', (data) => {
                var result = JSON.parse(data);

                accessTokenJson.access_token = result.access_token;
                accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                //更新本地存储的
                fs.writeFile(path.join(__dirname, '../config/access_token.json'), JSON.stringify(accessTokenJson), function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('saved')
                    }
                });

            })

        }).on('error', (e) => {
            console.error(e);
        })
    }

}


module.exports = WeChat;