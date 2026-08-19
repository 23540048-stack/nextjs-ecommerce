"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const SocketContext = createContext<{ socket: Socket | null }>({
  socket: null,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Đảm bảo chỉ chạy sau khi đã mount trên Client
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (user?.id) {
        socket.emit("join_room", user.id);
      }
    });

    socket.on("realtime_toast", (data: { action: string; message: string }) => {
      switch (data.action) {
        case "CART_ADD":
        case "WISHLIST_ADD":
        case "POINTS_EARNED":
        case "TIER_UPGRADE":
          toast.success(data.message);
          break;
        case "CART_REMOVE":
        case "WISHLIST_REMOVE":
          toast.info(data.message);
          break;
        case "ACCOUNT_BLOCKED":
          toast.error(data.message);
          break;
        default:
          toast(data.message);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("realtime_toast");
      socket.disconnect();
    };
  }, [hasMounted, user?.id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
