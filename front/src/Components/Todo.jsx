import "./Todo.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [inpt, setInpt] = useState("");
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const roomId = userId;

  useEffect(() => {
    const name = localStorage.getItem("fullName");
    if (!name) {
      navigate("/login");
    } else {
      setUser(name);
    }
  }, [navigate]);
  useEffect(() => {
    if (userId) {
      socket.emit("join_room", { roomId, currentUser: userId });
      
      socket.on("todos", (data) => {
        // console.log("Received todos from server:", data);
        setTodos(data);
      });
      
      socket.on("new_todo", (todo) => {
        setTodos((prev) => [...prev, todo]);
      });
      
      socket.on("delete_todo", ({ todoId }) => {
        setTodos((prev) => prev.filter((todo) => todo._id !== todoId));
      });
      
      return () => {
        socket.off("todos");
        socket.off("new_todo");
        socket.off("delete_todo");
      };
    }
  }, [roomId, userId]);

  const addTodo = () => {
    if (inpt.trim()) {
      socket.emit("add_todo", {
        roomId,
        userId,
        text: inpt,
        currentUser: userId,
      });
      setInpt("");
    }
  };

  const del = (id, owner) => {
    if (owner !== userId) return;
    socket.emit("delete_todo", {
      roomId,
      todoId: id,
      userId,
      currentUser: userId,
    });
  };

  return (
    <div className="todos">
      <h2>Welcome {user}! , Here are your Todos</h2>
      <div className="td">
        <input
          placeholder="Add your Todos"
          type="text"
          value={inpt}
          onChange={(e) => setInpt(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <div className="list">
        <ul className="todo-list">
          {todos.map((todo) => (
            <li id="list-item" key={todo._id || todo.id}>
              {todo.text}{" "}
              <button onClick={() => del(todo._id || todo.id, todo.user)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Todo;
