var express = require('express');
var router = express.Router();
const UserModel  = require('../db/model.js').UserModel;
const md5 = require('blueimp-md5');
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
router.post('/register',(req,res)=>{
  const {username,password,type}  = req.body;
  UserModel.findOne({username},(err,userDoc)=>{
    if(userDoc){
      res.send({code:1,msg:'该用户已存在'})
    }else {
      new UserModel({username,type,password:md5(password)}).save((err,userDoc)=>{
        res.cookie('userid',userDoc._id,{maxAge:1000*60*60})
        res.send({code:0,data:{username,type,_id:userDoc._id}})
      })
    }
  })
});

module.exports = router;
