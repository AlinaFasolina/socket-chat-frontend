import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function WebSocketClient() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("Connection...");
  const [isDisabled, setIsDisabled] = useState(true);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://socket-chat-iuwl.onrender.com");

    ws.current.onopen = () => {
      setStatus("Connected");
      toast.success("WebSocket connected");
      setIsDisabled(false);
    };

    ws.current.onmessage = async (event) => {
      let messageText;

      if (event.data instanceof Blob) {
        messageText = await event.data.text();
      } else {
        messageText = event.data;
      }

      try {
        const data = JSON.parse(messageText);
        if (data.type === "message") {
          setMessages((prev) => [...prev, `Recieved: ${data.text}`]);
          toast.info(`Message: ${data.text}`);
        }
      } catch (e) {
        setMessages((prev) => [...prev, `Recieved: ${messageText}`]);
        toast.info(`Message: ${messageText}`);
      }
    };

    ws.current.onclose = () => {
      setStatus("Disconnected");
      console.error("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      setStatus("Error");
      console.error("Error WebSocket:", error);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputValue && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "message", text: inputValue }));
      setMessages((prev) => [...prev, inputValue]);
      setInputValue("");
      toast("Message send");
    }
  };

  const handleInput = (e) => setInputValue(e.target.value);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">WebSocket Chat</h1>
      <p>Connection status: {status}</p>
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
      <form className="mt-4 flex" onSubmit={sendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          className="flex-1 border rounded px-2 py-1 mr-2"
          placeholder="Enter the message"
        />
        <button
          disabled={isDisabled}
          type="submit"
          className={`${
            isDisabled ? "bg-gray-300" : "bg-blue-500"
          }  text-white px-4 py-1 rounded`}
        >
          Send
        </button>
      </form>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
