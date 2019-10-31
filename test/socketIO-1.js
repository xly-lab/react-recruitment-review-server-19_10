module.exports = function (server) {
    const io = require('socket.io')(server);
    io.on('connection',(socket)=>{
        console.log('已有一个客户端连接');
        socket.on('sendMsg',function(data){
           console.log('客户端向服务器段发送的消息',data);
           data.name=data.name.toUpperCase();
           io.emit('receiveMsg',{name:data.name})
       })
    })
};
