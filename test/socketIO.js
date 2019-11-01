const moment = require('moment');
const ChatModel =require('../db/model').ChatModel;
module.exports = function (server) {
    const io = require('socket.io')(server);
    io.on('connection',(socket)=>{
        console.log('已有一个客户端连接');
        socket.on('sendMsg',function({fr,to,content}){
            const chat_id = [fr,to].sort().join('_');
            //数据要对应create_time是String，前面的Schema里要对应
            const create_time = moment(Date.now()).format('MM-DD HH:mm:ss');
            new ChatModel({fr,to,content,chat_id,read:false,create_time}).save((err,chatMsg)=>{
                   io.emit('receiveMsg',chatMsg);
                   console.log('服务器向客户器端发送的消息',chatMsg);
            });
       })
    })
};
