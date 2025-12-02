import { useEffect, useRef, useState } from "react";

const useWebSocket = (userId) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server
    ws.current = new WebSocket("ws://localhost:5000");

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);

      // Register user for notifications
      ws.current.send(
        JSON.stringify({
          type: "register",
          userId: userId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        // Accept all message types, not just notifications
        setLastMessage(data);
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId]);

  return { isConnected, lastMessage };
};

export default useWebSocket;
