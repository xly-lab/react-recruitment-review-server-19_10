var express = require('express');
var router = express.Router();

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
  const {username,password} =req.body;
  if(username==='admin'){
    res.send({code:1,msg:'该用户已存在'})
  }else {
    res.send({code:0,data:{id:'asdas',username,password}})
  }
});

module.exports = router;
