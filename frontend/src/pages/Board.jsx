import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSocketContext } from '../context/AppContext';
import { Toaster, toast } from 'sonner';

function Board() {
    const [socket, setSocket] = useState();
    const { authUser } = useSocketContext();
    const [currentUserSign, setCurrentUserSign] = useState("");
    const [nextTurn, setNextTurn] = useState("X");
    const [squares, setSquares] = useState(["", "", "", "", "", "", "", "", ""]);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        if (authUser) {
            const socket = io("http://localhost:5555/", {
                query: {
                    userId: authUser.username,
                    groupName: authUser.group
                }
            });
            setSocket(socket);

            socket.on("group_joined", ({ groupName, userId }) => {
                toast.success(`${userId} joined your group, group name: ${groupName}`);
            });

            socket.on("sign", ({ user1, user2 }) => {
                if (user1.name === authUser.username) {
                    setCurrentUserSign(user1.sign);
                } else {
                    setCurrentUserSign(user2.sign);
                }
            });

            socket.on("turn", ({ nextTurn, id, sign }) => {
                setSquares((prevSquares) =>
                    prevSquares.map((sq, i) => (i === id ? sign : sq))
                );
                setNextTurn(nextTurn);
            });
            socket.on("win", (d) => {
                toast.message(d)
            });
            return () => socket.close();
        } else {
            socket?.close();
            setSocket(null);
        }
    }, [authUser]);

    const winnerArr = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const handleClick = (i) => {
        if ((nextTurn === "O" && currentUserSign !== "O") || (nextTurn === "X" && currentUserSign !== "X")) return;
        if (squares[i] !== "" || winner) return; // Prevents overwriting a cell or playing after a win
        socket.emit("press", { nextTurn: currentUserSign, id: i, sign: currentUserSign });
    };

    const checkWinner = () => {
        for (let i = 0; i < winnerArr.length; i++) {
            const [a, b, c] = winnerArr[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                setWinner(squares[a]);
                socket.emit("winner", `${squares[a]} is the winner`)
                return squares[a];
            }
        }
        return null;
    };

    const checkDraw = () => {
        if (!squares.includes("") && !winner) {
            socket.emit("winner", `Drawwwwww`)
        }
    };

    useEffect(() => {
        const result = checkWinner();
        if (!result) {
            checkDraw();
        }
    }, [squares]);

    return (
        <div className="bg-gray-200 p-4 h-screen rounded-md shadow-md">
            {`${authUser.username} : ${currentUserSign}`}
            <div className='max-w-[50rem] mx-auto'>
                <div className="font-semibold text-lg mb-4">
                    {winner ? `Winner: ${winner}` : `Next player: ${nextTurn}`}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {squares.map((square, i) => (
                        <button
                            onClick={() => handleClick(i)}
                            key={i}
                            className="bg-white border border-gray-300 p-4 text-4xl h-14 font-bold text-center"
                        >
                            {square}
                        </button>
                    ))}
                </div>
            </div>
            <Toaster />
        </div>
    );
}

export default Board;
