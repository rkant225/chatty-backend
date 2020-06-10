const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server); //socket instance

const PORT = process.env.PORT || 5000;
let users = {};

io.on('connection', (socket)=>{

    socket.on('join', (name, callback)=>{
        users[socket.id] = name;
        io.emit('message', {user:'admin', text : `${name}, joined the chat.`}); // message to every one, including sender.
        io.emit('usersList', Object.values(users))
        callback(); 
    });

    socket.on('send', (messageObj, callback)=>{
        if(Object.keys(users).length > 1){
            io.emit('message', {user: messageObj.user , text : messageObj.text}); 
        } else {
            io.emit('message', {user: 'admin' , text : "Currently no one has joined the chat room, Please wait for others to join."});
        }
        //callback();
    });

    socket.on('exit', (name, callback)=>{
        const adminMsg = users[socket.id] ? `${users[socket.id]}, has left the chat.` : `Someone, has left the chat. This may be false message, we are working on it.`;
        io.emit('message', {user:'admin', text : adminMsg}); 

        if(users[socket.id] === 'rkant225'){
            io.emit('usersList', [])
            io.emit('message', {user:'admin', text : `Admin has removed all the users and. Please close the chat box and join the chat again, also ask your friends to do so.`});
            users = {};
         }else {
            delete users[socket.id];
            io.emit('usersList', Object.values(users));
        }
    })

    socket.on('disconnect', (name, callback)=>{
        const adminMsg = users[socket.id] ? `${users[socket.id]}, has left the chat.` : `Someone, has left the chat. This may be false message, we are working on it.`;
        io.emit('message', {user:'admin', text : adminMsg}); 
        
        if(users[socket.id] === 'rkant225'){
            io.emit('usersList', [])
            io.emit('message', {user:'admin', text : `Admin has removed all the users and. Please close the chat box and join the chat again, also ask your friends to do so.`});
            users = {};
        } else {
            delete users[socket.id];
            io.emit('usersList', Object.values(users));
        }


    })
})

app.use(router);
app.use(cors());


server.listen(PORT, ()=>console.log(`Server started listening at port : ${PORT}`));