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
        io.emit('usersCount', Object.keys(users).length)
        callback(); 
    });

    socket.on('send', (messageObj, callback)=>{
        io.emit('message', {user: messageObj.user , text : messageObj.text}); 
        //callback();
    });

    socket.on('exit', (name, callback)=>{
        io.emit('message', {user:'admin', text : `${users[socket.id]}, has left the chat.`}); 
        if(users[socket.id] === 'rkant225'){
            io.emit('usersCount', 0)
            io.emit('message', {user:'admin', text : `Admin has removed all the users and, disabled the chat box. Please close the chat box and join the chat again, also ask your friends to do so.`});
            users = {};
        }
    })

    socket.on('disconnect', (name, callback)=>{

        io.emit('message', {user:'admin', text : `${users[socket.id]}, has left the chat.`}); 
        if(users[socket.id] === 'rkant225'){
            io.emit('usersCount', 0)
            io.emit('message', {user:'admin', text : `Admin has removed all the users and, disabled the chat box. Please close the chat box and join the chat again, also ask your friends to do so.`});
            users = {};
        }

    })
})

app.use(router);
app.use(cors());


server.listen(PORT, ()=>console.log(`Server started listening at port : ${PORT}`));