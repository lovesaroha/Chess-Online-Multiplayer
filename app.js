// Require default node modules. 
var fs = require('fs');
var path = require('path');
var sha1 = require("sha1");
var server;

// Define default app variables.
server = require('http').createServer(handler);
const io = require('socket.io')(server, {});

// Default variables data.
var rooms = {};

// Port 3000.
const PORT = 3000;
console.log(`Server running at port ${PORT}`);
server.listen(PORT);

// Run this function on socket connection.
io.on('connection', function (socket) {

    // On socket disconnect.
    socket.on("disconnect", function (request) {
        removeMember(socket, io);
    });

    // Where one member left the room.
    socket.on("leaveRoom", function (request) {
        removeMember(socket, io);
    });

    // Create room function creates new room.
    socket.on("createRoom", function (data, callback) {
        let newRoom = {
            _id: new Date().getTime(),
            password: sha1(data.password),
            playerOne: { emailAddress: data.emailAddress, _id: socket.id, timeLeft: 1800 },
            playerTwo: {},
            nextMove: 1,
            board: newBoard()
        };
        rooms[newRoom._id] = newRoom;
        socket.join(newRoom._id);
        io.emit("roomAvailable", roomInfo(newRoom));
        callback(roomInfo(newRoom));
    });

    // Join room function.
    socket.on("joinRoom", function (request, callback) {
        let room = rooms[request.roomID];
        if (!isRoomAvailable(request.roomID, request.password)) {
            callback({ error: "Cannot join this room." });
            return;
        }
        // Set player.
        if (rooms[room._id].playerOne.emailAddress) {
            rooms[room._id].playerTwo = { emailAddress: request.emailAddress, _id: socket.id };
        } else {
            rooms[room._id].playerOne = { emailAddress: request.emailAddress, _id: socket.id };
        }
        callback(roomInfo(room));
        socket.to(room._id).emit("playerJoined", { emailAddress: request.emailAddress, roomID: room._id, _id: socket.id });
        io.emit("roomUnavailable", { roomID: room._id });
        socket.join(room._id);
    });

    // Make move function event on game move.
    socket.on("makeMove", function (request) {
        let room = rooms[request.roomID];
        if (!room) { return; }
        if ((room.nextMove == 1 && socket.id == room.playerTwo._id) || (room.nextMove == -1 && socket.id == room.playerOne._id)) { return; }
        if (invalidBoard(room.board, request.board)) { return; }
        let gameOver = checkBoard(room._id, request.from, request.to);
        if (gameOver) { resetRoom(room._id); }
        io.in(request.roomID).emit("moveMade", { from: request.from, to: request.to, roomID: room._id });
    });

    // Create message event.
    socket.on("createMessage", function (request) {
        let room = rooms[request.roomID];
        if (!room) { return; }
        socket.to(room._id).emit("receiveMessage", request);
    });
});

// Function to remove room member.
function removeMember(socket, io) {
    Object.keys(rooms).forEach(_id => {
        let room = rooms[_id];
        let removed = false;
        if (rooms[_id].playerOne._id == socket.id) {
            // Player one left.
            rooms[_id].playerOne = {};
            removed = true;
        }
        if (rooms[_id].playerTwo._id == socket.id) {
            // Player two left.
            rooms[_id].playerTwo = {};
            removed = true;
        }
        if (!removed) { return; }
        if (!rooms[_id].playerOne.emailAddress && !rooms[_id].playerTwo.emailAddress) {
            // Remove room.
            io.emit("roomUnavailable", { roomID: _id });
            delete rooms[_id];
        } else {
            resetRoom(room._id);
            socket.to(room._id).emit("playerLeft", { roomID: _id, _id: socket.id });
            io.emit("roomAvailable", roomInfo(rooms[_id]));
        }
        socket.leave(room._id);
    });
}

// This function reset given room.
function resetRoom(id) {
    if (!rooms[id]) { return; }
    rooms[id].board = newBoard();
    rooms[id].nextMove = 1;
}

// This function return new board.
function newBoard() {
    let board = [[5, 3, 4, 9, 28, 4, 3, 5], [1, 1, 1, 1, 1, 1, 1, 1]];
    for (let row = 0; row < 4; row++) {
        let row = [];
        for (let col = 0; col < 8; col++) {
            row.push(0);
        }
        board.push(row);
    }
    board.push([-1, -1, -1, -1, -1, -1, -1, -1]);
    board.push([-5, -3, -4, -28, -9, -4, -3, -5]);
    return board;
}

// This function  checks board.
function invalidBoard(serverBoard, clientBoard) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (serverBoard[row][col] != clientBoard[row][col]) { return true; }
        }
    }
    return false;
}

// This function chek board.
function checkBoard(id, from, to) {
    if (!rooms[id]) { return false; }
    if (rooms[id].board[to[0]][to[1]] == 28 || rooms[id].board[to[0]][to[1]] == -28) { return true; }
    // Check pawn.
    if (Math.abs(rooms[id].board[from[0]][from[1]]) == 1 && (to[0] == 0 || to[0] == 7)) {
        // Add queen.
        rooms[id].board[to[0]][to[1]] = 9 * rooms[id].nextMove;
    } else {
        rooms[id].board[to[0]][to[1]] = rooms[id].board[from[0]][from[1]];
    }
    rooms[id].board[from[0]][from[1]] = 0;
    rooms[id].nextMove *= -1;
    return false;
}

// This function check if room is available or valid.
function isRoomAvailable(id, password) {
    if (!rooms[id]) { return false; }
    if (rooms[id].playerOne.emailAddress && rooms[id].playerTwo.emailAddress) { return false; }
    if (sha1(password) != rooms[id].password) { return false; }
    return true;
}

// This function return room info.
function roomInfo(room) {
    return { _id: room._id, playerOne: room.playerOne, playerTwo: room.playerTwo, password: room.password };
}

// Create http server and listen on port 3000.
function handler(request, response) {
    // If request method is get than call function based on matching route.
    if (request.method == 'GET') {
        if (request.url.match(new RegExp("/api/rooms", 'i'))) {
            let roomList = {};
            Object.keys(rooms).forEach(_id => {
                if (rooms[_id].playerOne.emailAddress && rooms[_id].playerTwo.emailAddress) { return; }
                roomList[_id] = roomInfo(rooms[_id]);
            });
            response.writeHead(200);
            response.end(JSON.stringify(roomList), 'utf-8');
            return;
        }
    }
    var filePath = './static' + request.url;
    if (filePath == './static/') { filePath = './static/index.html'; }
    // All the supported content types are defined here.
    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png'
    };
    var contentType = mimeTypes[extname] || 'application/json';
    // Read file from server based on request url.
    fs.readFile(filePath, function (error, content) {
        if (error) {
            response.writeHead(500);
            response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}
