import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function WebSocketClient() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://socket-chat-iuwl.onrender.com");

    ws.current.onopen = () => {
      toast.success("WebSocket подключен");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "typing") {
          setTyping(data.text);
        } else if (data.type === "message") {
          setMessages((prev) => [...prev, `Получено: ${data.text}`]);
          toast.info(`Сообщение: ${data.text}`);
          setTyping("");
        }
      } catch (e) {
        setMessages((prev) => [...prev, `Получено: ${event.data}`]);
        toast.info(`Сообщение: ${event.data}`);
        setTyping("");
      }
    };

    ws.current.onclose = () => {
      console.error("WebSocket отключен");
    };

    ws.current.onerror = (error) => {
      console.error("Ошибка WebSocket:", error);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (input && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "message", text: input }));
      setMessages((prev) => [...prev, `Отправлено: ${input}`]);
      setInput("");
      toast("Сообщение отправлено");
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "typing", text: value }));
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">WebSocket Чат</h1>
      {typing && (
        <div className="text-xs italic text-gray-500 mb-2">
          Печатает: {typing}
        </div>
      )}
      <div className="border rounded p-2 h-64 overflow-auto bg-gray-100">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-1 text-sm max-w-fit px-2 py-1 rounded bg-white ${
              idx % 2 === 0
                ? "ml-auto text-left bg-blue-100"
                : "mr-auto text-right bg-green-100"
            }`}
          >
            {msg}
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          className="flex-1 border rounded px-2 py-1 mr-2"
          placeholder="Введите сообщение"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Отправить
        </button>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
