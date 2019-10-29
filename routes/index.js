var express = require('express');
var router = express.Router();
const UserModel  = require('../db/model.js').UserModel;
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
        res.cookie('userid',userDoc._id,{maxAge:1000*60*60});
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

module.exports = router;
