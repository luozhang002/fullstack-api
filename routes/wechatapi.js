rypto = require('crypto');
var wechat = require('wechat');
var http = require('http');
var querystring = require("querystring");

var token="weixin";
// 监听
exports.listener = function(req, res, next){
    try{
        var signature = req.query.signature;
        var timestamp = req.query.timestamp;
        var nonce = req.query.nonce;
        var echostr = req.query.echostr;
        /*  加密/校验流程如下： */
        //1. 将token、timestamp、nonce三个参数进行字典序排序
        var array = new Array(token,timestamp,nonce);
        array.sort();
        var str = array.toString().replace(/,/g,"");

        //2. 将三个参数字符串拼接成一个字符串进行sha1加密
        var sha1Code = crypto.createHash("sha1");
        var code = sha1Code.update(str,'utf-8').digest("hex");
        //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
        if(code===signature){
            res.send(echostr);
            console.log(""+echostr);
        }else{
            res.send("error");
        }
    }catch(error){
         console.log("error:"+error);
    }
};
//f6a4b574b35b4da1aa1477ca193bb687
exports.wechat_method=wechat(token,function (req,res) {

    var message=req.weixin;
    if (message && message.MsgType == 'text') {
        var text = '';
        var description = '';
        switch (message.Content) {
            case '关键词1':
                res.reply({
                    content: 'hello world!',
                    type: 'text'
                });
                break;
            case '关键词2':
                text = '关键词2';
                description = message.ToUserName + '----' + message.FromUserName;
                res.reply([
                    {
                        title: text,
                        description: description,
                        picurl: '图片绝对地址',
                        url: '' }
                ]);
                break;
            default:
               //默认回复文本消息
                try{
                         var post_data = querystring.stringify({
                        key: 'f6a4b574b35b4da1aa1477ca193bb687',
                        info: message.Content
                        });
                var options = {
                        host: 'www.tuling123.com',
                        port: 80,
                        path: '/openapi/api',
                        method: 'POST',
                        rejectUnauthorized: false,
                        headers: {
                                "Content-Type": 'application/x-www-form-urlencoded', //这个一定要有
                        }
                };
                var req2 = http.request(options, function (res2) {
                        res2.setEncoding('utf8');
                        res2.on('data', function (chunk) {

                        var result = eval("(" + chunk + ")");
                         res.reply({
                                content: result.text,
                                type: 'text'
                        });
                });
         });
                        req2.write(post_data);
                        req2.end();
                }catch(e){
                        console.log(e+"");
                }

                break;
        }
    } else if (message && message.Event) {
        switch (message.Event) {
            case 'subscribe':
                res.reply({
                    content: '欢迎大大关注小安安，么么哒～',
                    type: 'text'
                });
                break;
            case 'unsubscribe':    //取消关注
                break;
            default:
                res.reply({
                    content: 'O(∩_∩)O~',
                    type: 'text'
                });
                break;
        }
    }
});