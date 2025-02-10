

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Friends from "./Friends";
import Todo from "./Todo";
import Navbar from "./Navbar";

const socket = io("http://localhost:8000");

const Dash = () => {
  const userId = localStorage.getItem("userId");
  const [loggedInUserId] = useState(userId);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [todos, setTodos] = useState({});
  const [newTodo, setNewTodo] = useState("");

 
  const roomId = selectedFriend
    ? [loggedInUserId, selectedFriend._id].sort().join("-")
    : loggedInUserId;

  useEffect(() => {
    if (loggedInUserId) {
      socket.emit("join_room", { roomId, currentUser: loggedInUserId });

      socket.on("connect", () => {
        console.log("Connected to Server");
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socket.on("todos", (data) => {
        setTodos((prevTodos) => ({
          ...prevTodos,
          [roomId]: data,
        }));
      });

      socket.on("new_todo", (todo) => {
        setTodos((prevTodos) => ({
          ...prevTodos,
          [roomId]: [...(prevTodos[roomId] || []), todo],
        }));
      });

      socket.on("delete_todo", ({ todoId }) => {
        setTodos((prevTodos) => {
          if (!prevTodos[roomId]) return prevTodos;
          return {
            ...prevTodos,
            [roomId]: prevTodos[roomId].filter((todo) => todo._id !== todoId),
          };
        });
      });

      return () => {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("todos");
        socket.off("new_todo");
        socket.off("delete_todo");
      };
    }
  }, [roomId, loggedInUserId]);


  const handleAddTodo = () => {
    if (newTodo.trim() === "") return;

    socket.emit("add_todo", {
      roomId,
      userId: loggedInUserId,
      text: newTodo,
      currentUser: loggedInUserId,
    });
    setNewTodo("");
  };


  const handleDeleteTodo = (todoId, todoOwner) => {
    if (todoOwner !== loggedInUserId) return;
    socket.emit("delete_todo", {
      roomId,
      todoId,
      userId: loggedInUserId,
      currentUser: loggedInUserId,
    });
  };


  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };


  const handleSendRequest = async (userId) => {
    try {
      const response = await fetch("http://localhost:8000/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ from: loggedInUserId, to: userId }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <Friends
          onSendRequest={handleSendRequest}
          onSelectFriend={handleSelectFriend}
          loggedInUserId={loggedInUserId}
        />
        <Todo />
        {selectedFriend ? (
          <div className="todos">
            <h2>Your Shared Todos with {selectedFriend.fullName}</h2>
            <div className="td">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a todo..."
              />
              <button onClick={handleAddTodo}>Add</button>
            </div>
            <div className="list">
              <ul className="todo-list">
                {(todos[roomId] || []).map((todo) => (
                  <li key={todo._id} id="list-item">
                    {todo.text}
                    {todo.user === loggedInUserId && (
                      <button onClick={() => handleDeleteTodo(todo._id, todo.user)}>
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="todos">
            <h2 id="simpleUsage">Click on a friend to share your todos</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dash;
