/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/
// All functions related to game.
// Show board function shows board values.

// Show board function shows board values.
function showBoard() {
    if (!activeRoom._id) { return; }
    for (let i = 0; i < possibleMoves.length; i++) {
        ctx.beginPath();
        ctx.arc((possibleMoves[i][1] * 80) + 40, (possibleMoves[i][0] * 80) + 40, 5, 0, 2 * Math.PI);
        ctx.lineWidth = 10;
        ctx.strokeStyle = colorTheme.normal;
        ctx.stroke();
    }
    ctx.font = '300 70px "Font Awesome 5 Pro"';
    ctx.textAlign = 'center';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (activeRoom.board[row][col] != 0) {
                if (activeRoom.board[row][col] < 0) {
                    ctx.fillStyle = colorTheme.dark;
                    ctx.fillText(icons[activeRoom.board[row][col] * -1], (col * 80) + 40, (row * 80) + 65);
                } else {
                    ctx.fillStyle = colorTheme.light;
                    ctx.fillText(icons[activeRoom.board[row][col]], (col * 80) + 40, (row * 80) + 65);
                }
            }
        }
    }
    // Show rectangles.
    let show = -1;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (show == 1) {
                // Show rectangle.
                ctx.beginPath();
                ctx.fillStyle = colorTheme.veryLight;
                ctx.fillRect((col * 80), (row * 80), 80, 80);
                ctx.stroke();
            }
            show *= -1;
        }
        show *= -1;
    }
}

// Get input position.
function getPosition(x, y) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (x > (col * 80) && x < (col * 80) + 100) {
                if (y > (row * 80) && y < (row * 80) + 100) {
                    return [row, col];
                }
            }
        }
    }
}

// This function return possible moves.
function getPossibleMoves(position) {
    possibleMoves = [];
    let piece = activeRoom.board[position[0]][position[1]];
    let moves = [];
    if (position[0] == selectedPosition[0] && position[1] == selectedPosition[1]) {
        return moves;
    }
    let option = Math.abs(piece);
    switch (option) {
        case 1:
            // Pawn.
            let totalMoves = 1;
            if ((position[0] == 6 && piece < 0) || (position[0] == 1 && piece > 0)) {
                totalMoves = 2;
            }
            for (m = 1; m <= totalMoves; m++) {
                let change = (m * activeRoom.nextMove);
                if (activeRoom.board[position[0] + change][position[1]] == 0) {
                    moves.push([position[0] + change, position[1]]);
                } else {
                    totalMoves = 1;
                }
                if (m < 2) {
                    let leftLimit = position[1] - 1;
                    let rightLimit = position[1] + 1;
                    if (rightLimit < 8) {
                        if (checkMove(position[0] + change, rightLimit, piece) == true) {
                            if (activeRoom.board[position[0] + change][rightLimit] != 0 || (activeRoom.board[position[0] + change][position[1]] * piece) > 0) {
                                moves.push([position[0] + change, rightLimit]);
                            }
                        }
                    }
                    if (leftLimit >= 0) {
                        if (checkMove(position[0] + change, leftLimit, piece) == true) {
                            if (activeRoom.board[position[0] + change][leftLimit] != 0 || (activeRoom.board[position[0] + change][position[1]] * piece) > 0) {
                                moves.push([position[0] + change, leftLimit]);
                            }
                        }
                    }
                }
            }
            return moves;
        case 5:
            // Rock piece.
            return checkStraight(position, piece, moves, 9);
        case 4:
            // Bishp.
            return checkDiagonally(position, piece, moves, 9);
        case 9:
            // Queen;
            moves = checkStraight(position, piece, moves, 9);
            return checkDiagonally(position, piece, moves, 9);
        case 28:
            // King.
            moves = checkStraight(position, piece, moves, 2);
            return checkDiagonally(position, piece, moves, 2);
        case 3:
            // Knight.    
            if (position[0] - 2 >= 0) {
                if (position[1] + 1 < 8) {
                    if (checkMove(position[0] - 2, position[1] + 1, piece) == true) {
                        moves.push([position[0] - 2, position[1] + 1]);
                    }
                }
                if (position[1] - 1 >= 0) {
                    if (checkMove(position[0] - 2, position[1] - 1, piece) == true) {
                        moves.push([position[0] - 2, position[1] - 1]);
                    }
                }
            }
            if (position[0] + 2 < 8) {
                if (position[1] + 1 < 8) {
                    if (checkMove(position[0] + 2, position[1] + 1, piece) == true) {
                        moves.push([position[0] + 2, position[1] + 1]);
                    }
                }
                if (position[1] - 1 >= 0) {
                    if (checkMove(position[0] + 2, position[1] - 1, piece) == true) {
                        moves.push([position[0] + 2, position[1] - 1]);
                    }
                }
            }
            if (position[1] - 2 >= 0) {
                if (position[0] + 1 < 8) {
                    if (checkMove(position[0] + 1, position[1] - 2, piece) == true) {
                        moves.push([position[0] + 1, position[1] - 2]);
                    }
                }
                if (position[0] - 1 >= 0) {
                    if (checkMove(position[0] - 1, position[1] - 2, piece) == true) {
                        moves.push([position[0] - 1, position[1] - 2]);
                    }
                }
            }
            if (position[1] + 2 < 8) {
                if (position[0] + 1 < 8) {
                    if (checkMove(position[0] + 1, position[1] + 2, piece) == true) {
                        moves.push([position[0] + 1, position[1] + 2]);
                    }
                }
                if (position[0] - 1 >= 0) {
                    if (checkMove(position[0] - 1, position[1] + 2, piece) == true) {
                        moves.push([position[0] - 1, position[1] + 2]);
                    }
                }
            }
    }
    return moves;
}

// This function check move.
function checkMove(row, column, piece) {
    if (((activeRoom.board[row][column] > 0 || activeRoom.board[row][column] == 0) && piece < 0) || ((activeRoom.board[row][column] < 0 || activeRoom.board[row][column] == 0) && piece > 0)) {
        return true;
    }
    return false;
}

// This function check horizontal moves.
function checkStraight(position, piece, moves, maximum) {
    let direction = [true, true, true, true];
    for (let i = 1; i < maximum; i++) {
        if (position[0] - i >= 0 && direction[0] == true) {
            if (checkMove(position[0] - i, position[1], piece) == true) {
                moves.push([position[0] - i, position[1]]);
                if (activeRoom.board[position[0] - i][position[1]] != 0) {
                    direction[0] = false;
                }
            } else {
                direction[0] = false;
            }
        }
        if (position[0] + i < 8 && direction[1] == true) {
            if (checkMove(position[0] + i, position[1], piece) == true) {
                moves.push([position[0] + i, position[1]]);
                if (activeRoom.board[position[0] + i][position[1]] != 0) {
                    direction[1] = false;
                }
            } else {
                direction[1] = false;
            }
        }
        if (position[1] - i >= 0 && direction[2] == true) {
            if (checkMove(position[0], position[1] - i, piece) == true) {
                moves.push([position[0], position[1] - i]);
                if (activeRoom.board[position[0]][position[1] - i] != 0) {
                    direction[2] = false;
                }
            } else {
                direction[2] = false;
            }
        }
        if (position[1] + i < 8 && direction[3] == true) {
            if (checkMove(position[0], position[1] + i, piece) == true) {
                moves.push([position[0], position[1] + i]);
                if (activeRoom.board[position[0]][position[1] + i] != 0) {
                    direction[3] = false;
                }
            } else {
                direction[3] = false;
            }
        }
    }
    return moves;
}

// This function check diagonally.
function checkDiagonally(position, piece, moves, maximum) {
    let direction = [true, true, true, true];
    for (let i = 1; i < maximum; i++) {
        if (position[0] - i >= 0 && position[1] - i >= 0 && direction[0] == true) {
            if (checkMove(position[0] - i, position[1] - i, piece) == true) {
                moves.push([position[0] - i, position[1] - i]);
                if (activeRoom.board[position[0] - i][position[1] - i] != 0) {
                    direction[0] = false;
                }
            } else {
                direction[0] = false;
            }
        }
        if (position[0] - i >= 0 && position[1] + i < 8 && direction[1] == true) {
            if (checkMove(position[0] - i, position[1] + i, piece) == true) {
                moves.push([position[0] - i, position[1] + i]);
                if (activeRoom.board[position[0] - i][position[1] + i] != 0) {
                    direction[1] = false;
                }
            } else {
                direction[1] = false;
            }
        }
        if (position[0] + i < 8 && position[1] - i >= 0 && direction[2] == true) {
            if (checkMove(position[0] + i, position[1] - i, piece) == true) {
                moves.push([position[0] + i, position[1] - i]);
                if (activeRoom.board[position[0] + i][position[1] - i] != 0) {
                    direction[2] = false;
                }
            } else {
                direction[2] = false;
            }
        }
        if (position[0] + i < 8 && position[1] + i < 8 && direction[3] == true) {
            if (checkMove(position[0] + i, position[1] + i, piece) == true) {
                moves.push([position[0] + i, position[1] + i]);
                if (activeRoom.board[position[0] + i][position[1] + i] != 0) {
                    direction[3] = false;
                }
            } else {
                direction[3] = false;
            }
        }
    }
    return moves;
}

// Make move function makes a move.
function makeMove(from, to) {
    if (!activeRoom._id) { return; }
    if (possibleMoves.length == 0 || from.length == 0) { return; }
    let moveFound = false;
    // Check moves.
    for (let i = 0; i < possibleMoves.length; i++) {
        if (to[0] == possibleMoves[i][0] && to[1] == possibleMoves[i][1]) {
            moveFound = true;
            break;
        }
    }
    if (!moveFound) { return; }
    user.socket.emit("makeMove", { roomID: activeRoom._id, board: activeRoom.board, from: from, to: to });
}

// This function update board.
function updateBoard(response) {
    if (!activeRoom._id) { return; }
    possibleMoves = [];
    selectedPosition = [];
    if (activeRoom.board[response.to[0]][response.to[1]] == 28) {
        resetGame();
        showModal(`<div class="bg-modal fade-in modal-content mx-auto mt-10 overflow-hidden p-4 shadow-xl sm:max-w-lg sm:w-full"><center><i class="fad fa-trophy fa-5x mb-1 text-primary"></i> <h1 class="mb-0 font-bold">Game Over</h1>
            <h4 class="text-subtitle">Black won this game</h4></center></div>`);
        activeRoom.playerTwo.score++;
        showPlayerCards();
        return;
    }
    if (activeRoom.board[response.to[0]][response.to[1]] == -28) {
        resetGame();
        showModal(`<div class="bg-modal fade-in modal-content mx-auto mt-10 overflow-hidden p-4 shadow-xl sm:max-w-lg sm:w-full"><center><i class="fad fa-trophy fa-5x mb-1 text-primary"></i> <h1 class="mb-0 font-bold">Game Over</h1>
            <h4 class="text-subtitle">White won this game</h4></center></div>`);
        activeRoom.playerOne.score++;
        showPlayerCards();
        return;
    }
    if (activeRoom.board[response.to[0]][response.to[1]] < 0) {
        activeRoom.playerOne.points += activeRoom.board[response.to[0]][response.to[1]] * -1;
    }
    if (activeRoom.board[response.to[0]][response.to[1]] > 0) {
        activeRoom.playerTwo.points += activeRoom.board[response.to[0]][response.to[1]];
    }
    // Check pawn.
    if (Math.abs(activeRoom.board[response.from[0]][response.from[1]]) == 1 && (response.to[0] == 0 || response.to[0] == 7)) {
        // Add queen.
        activeRoom.board[response.to[0]][response.to[1]] = 9 * activeRoom.nextMove;
    } else {
        activeRoom.board[response.to[0]][response.to[1]] = activeRoom.board[response.from[0]][response.from[1]];
    }
    activeRoom.board[response.from[0]][response.from[1]] = 0;
    activeRoom.nextMove *= -1;
    showPlayerCards();
}

// Move made by other user.
user.socket.on("moveMade", updateBoard);

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

// This function reset game.
function resetGame(id) {
    if (!activeRoom._id) { return; }
    selectedPosition = [];
    possibleMoves = [];
    activeRoom.board = newBoard();
    activeRoom.nextMove = 1;
    if (activeRoom.playerOne.emailAddress) {
        activeRoom.playerOne.points = 0;
    }
    if (activeRoom.playerTwo.emailAddress) {
        activeRoom.playerTwo.points = 0;
    }
}

// Add player to active activeRoom.
function addPlayerToRoom(player) {
    if (!activeRoom._id) { return; }
    if (activeRoom.playerOne.emailAddress) {
        activeRoom.playerTwo = { emailAddress: player.emailAddress, score: 0, points: 0, _id: player._id };
    } else {
        activeRoom.playerOne = { emailAddress: player.emailAddress, score: 0, points: 0, _id: player._id };
    }
}

// Add user input.
function addUserInput(e) {
    if (!activeRoom._id) { return; }
    if (!activeRoom.playerOne._id || !activeRoom.playerTwo._id || !isRoomMember()) { return; }
    if ((activeRoom.nextMove == 1 && user.socket.id == activeRoom.playerTwo._id) || (activeRoom.nextMove == -1 && user.socket.id == activeRoom.playerOne._id)) { return; }
    let position = getPosition(e.offsetX, e.offsetY);
    if (!position) { return; }
    let piece = activeRoom.board[position[0]][position[1]];
    if (activeRoom.nextMove * piece > 0) {
        // Select piece.
        possibleMoves = getPossibleMoves(position);
        selectedPosition = position;
        return;
    }
    if (selectedPosition.length > 0) {
        if ((activeRoom.nextMove == 1 && activeRoom.board[selectedPosition[0]][selectedPosition[1]] < 0) || (activeRoom.nextMove == -1 && activeRoom.board[selectedPosition[0]][selectedPosition[1]] > 0)) { return; }
        if ((activeRoom.nextMove == 1 && piece > 0) || (activeRoom.nextMove == -1 && piece < 0)) { return; }
        // Reset selected piece make a move.
        makeMove(selectedPosition, position);
    }
}

// Draw.
function draw() {
    if (!window.location.hash.includes(activeRoom._id)) { return; }
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showBoard();
    window.requestAnimationFrame(draw);
}