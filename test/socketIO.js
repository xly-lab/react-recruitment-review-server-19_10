const moment = require('moment');
const {ChatModel} =require('../db/model');
module.exports = function (server) {
    const io = require('socket.io')(server);
    io.on('connection',(socket)=>{
        console.log('已有一个客户端连接');
        socket.on('sendMsg',function({from,to,content}){
            const chat_id = [from,to].sort().join('_');
            const create_time = moment(Date.now()).format('MM-DD HH:mm:ss');
            new ChatModel({from,to,content,chat_id,create_time}).save((err,chatMsg)=>{
                   io.emit('receiveMsg',chatMsg);
                   console.log('服务器向客户器端发送的消息',chatMsg);
            });
       })
    })
};
