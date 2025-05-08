import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

export default function WebSocketClient() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://socket-chat-iuwl.onrender.com");

    ws.current.onopen = () => {
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
          setMessages((prev) => [
            ...prev,
            { text: data.text, sender: "outer" },
          ]);
        } else if (data.type === "typing") {
          setIsSomeoneTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsSomeoneTyping(false);
          }, 2000);
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          { text: messageText, sender: "outer" },
        ]);
      }
    };

    ws.current.onclose = () => {
      console.error("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
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
      setMessages((prev) => [...prev, { text: inputValue, sender: "me" }]);
      setInputValue("");
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "typing" }));
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">WebSocket Chat</h1>
      {isDisabled && (
        <div className="flex items-center mb-[20px]">
          <span className="mr-[10px]">Connecting to WebSocket</span>
          <Loader loading={isDisabled} />
        </div>
      )}

      <div className="border rounded pt-2 pr-2 pl-2 pb-8 h-64 bg-gray-100 relative">
        <div className="overflow-auto h-full pr-[10px] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-[#0b08391a] [&::-webkit-scrollbar-thumb]:bg-[#a1a1a1] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-1 text-sm max-w-fit px-2 py-1 rounded ${
                msg.sender === "me"
                  ? "ml-auto text-left bg-white"
                  : "mr-auto text-right bg-blue-100 "
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {isSomeoneTyping && (
          <p className="absolute bottom-[3px] r-0 text-sm italic text-gray-500">
            Typing...
          </p>
        )}
      </div>

      <form className="mt-4 flex" onSubmit={sendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          className="flex-1 border rounded px-2 py-1 mr-2 outline-none"
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
