var express = require('express');
var router = express.Router();
const UserModel= require('../db/model.js').UserModel;
const ChatModel= require('../db/model.js').ChatModel;
const md5 = require('blueimp-md5');
const filter = {password:0,__v:0};
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*
* 提供一个用户注册的接口
* a) path 为: /register
* b) 请求方式为: POST
* c) 接收 username 和 password 参数
* d) admin 是已注册用户
* e) 注册成功返回: {code: 0, data: {_id: 'abc', username: ‘xxx’, password:’123’}
* f) 注册失败返回: {code: 1, msg: '此用户已存在'}*/
// 注册
router.post('/register',(req,res)=>{
  const {username,password,type}  = req.body;
  UserModel.findOne({username},(err,userDoc)=>{
    if(userDoc){
      res.send({code:1,msg:'该用户已存在'})
    }else {
      new UserModel({username,type,password:md5(password)}).save((err,userDoc)=>{
        res.cookie('userid',userDoc._id,{maxAge:1000*60*60*2});
        res.send({code:0,data:{username,type,_id:userDoc._id}})
      })
    }
  })
});
// 登录
router.post('/login',(req,res)=>{
  const {username,password} = req.body;
  UserModel.findOne({username,password:md5(password)},filter,(err,userDoc)=>{
    if(userDoc){
      res.cookie('userid',userDoc._id,{maxAge:1000*60*60});
      res.send({code:0,data:userDoc})
    }else {
      res.send({code:1,msg:'输入用户不存在或密码错误'})
    }
  })
});

router.post('/update',(req,res)=>{
  const userid = req.cookies.userid;
  if(!userid){
    return res.send({code:1,msg:'请先登录'});
  }
  const user = req.body;
  UserModel.findByIdAndUpdate({_id:userid},user,(err,oldUserDoc)=>{
    if(!oldUserDoc){
      res.clearCookie('userid');
      res.send({code:1,msg:'登录失效，请重新登录'});
    }else {
      const {_id,type,username} = oldUserDoc;
      const data=Object.assign({_id,type,username},user);
      res.send({code:0,data})
    }

  })
});
router.get('/user',(req,res)=>{
  const userid = req.cookies.userid;
  if(!userid){
    return res.send({code:1,msg:'请先登录'});
  }
  UserModel.findOne({_id:userid},filter,(err,userDoc)=>{
    if (userDoc){
      res.send({code:0,data:userDoc});
    }else {
      res.send({code:1,msg:"登录失效"})
    }
  })
});
router.get('/userlist',(req,res)=>{
///userlist?type=boss-------此种传参行为为query方式
///userlist/:type-------此种传参行为为params方式
  const {type} = req.query;
  UserModel.find({type},filter,(err,users)=>{
    if(users.length!==0){
      res.send({code:0,data:users})
    }
  })
});

/*获取当前用户所有相关聊天信息列表 */
router.get('/msglist', function (req, res) {
  // 获取 cookie 中的 userid ;
   const userid = req.cookies.userid ;
   // 查询得到所有 user 文档数组
   UserModel.find(function (err, userDocs) {
     // 用对象存储所有 user 信息: key 为 user 的_id, val 为 name 和 header 组成的 user 对象
     // const users = {} ;
     // // 对象容器
     // userDocs.forEach(doc => { users[doc._id] = {username: doc.username, header: doc.header} });
     const users = userDocs.reduce((users,user)=>{
       users[user._id]={username:user.username,header:user.header};
       return users;
     },{});
     /*查询 userid 相关的所有聊天信息 参数 1: 查询条件 参数 2: 过滤条件 参数 3: 回调函数 */
     ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
       // 返回包含所有用户和当前用户相关的所有聊天消息的数据
       res.send({code: 0, data: {users, chatMsgs}})
     })
   })
});

/*修改指定消息为已读 */
router.post('/readmsg', function (req, res) {
  // 得到请求中的 from 和 to
  const from = req.body.from ;
  const to = req.cookies.userid;
  /*更新数据库中的 chat 数据
  参数 1: 查询条件
  参数 2: 更新为指定的数据对象
  参数 3: 是否 1 次更新多条, 默认只更新一条
  参数 4: 更新完成的回调函数 */
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    console.log('/readmsg', doc) ;
    res.send({code: 0, data: doc.nModified});
    // 更新的数量
    })
});

module.exports = router;
