import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../services/api";

export interface Message {
  role: "user" | "assistant";
  text: string;
  tools?: string[];
}

interface Session {
  id: number;
  title: string;
  messages: Message[];
}

export function useChat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const activeSession = sessions.find((s) => s.id === activeId);

  // --- 1. Auth Check -----------
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  // --- 2. Inactivity Logout ---
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const logoutUser = () => {
      localStorage.removeItem("token");
      navigate("/");
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logoutUser, 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate]);

  // --- 3. Initial Load ---
  useEffect(() => {
    loadSessions();
  }, []);

  // --- API Actions ---
  const loadSessions = async () => {
    try {
      const res = await API.get("/chat/sessions");
      const sessionsWithMessages = res.data.map((s: any) => ({ ...s, messages: [] }));
      setSessions(sessionsWithMessages);
      if (sessionsWithMessages.length > 0) {
        setActiveId(sessionsWithMessages[0].id);
        loadMessages(sessionsWithMessages[0].id);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const loadMessages = async (sessionId: number) => {
    try {
      const res = await API.get(`/chat/messages/${sessionId}`);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: res.data } : s))
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await API.post("/chat/session");
      const newSession: Session = {
        id: res.data.session_id,
        title: "New Chat",
        messages: [],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(newSession.id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSession = async (id: number) => {
    try {
      await API.delete(`/chat/session/${id}`);
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      setActiveId(updated.length > 0 ? updated[0].id : null);
    } catch (err) {
      console.error(err);
    }
  };

  const renameSession = async (id: number) => {
    if (!newTitle.trim()) return;
    try {
      await API.put(`/chat/session/${id}`, { title: newTitle });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession) return;

    const currentInput = input;
    const userMessage: Message = { role: "user", text: currentInput };
    const isFirstMessage = activeSession.messages.length === 0;

    // Update UI immediately for user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id ? { ...s, messages: [...s.messages, userMessage] } : s
      )
    );
    
    setInput("");
    setLoading(true);

    try {
      // Handle title generation for first message
      if (isFirstMessage) {
        const title = currentInput.length > 30 ? currentInput.substring(0, 30) + "..." : currentInput;
        setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? { ...s, title } : s)));
        await API.put(`/chat/session/${activeSession.id}`, { title });
      }

      const res = await API.post("/chat/send", {
        query: currentInput,
        session_id: activeSession.id,
      });

      const botMessage: Message = {
        role: "assistant",
        text: res.data.result,
        tools: res.data.tools,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, messages: [...s.messages, botMessage] } : s
        )
      );
    } catch (err: any) {
      const errorMsg: Message = { role: "assistant", text: "Error: " + err.message };
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, loading]);

  return {
    sessions,
    activeId,
    setActiveId,
    input,
    setInput,
    loading,
    editingId,
    setEditingId,
    newTitle,
    setNewTitle,
    bottomRef,
    activeSession,
    createNewChat,
    deleteSession,
    renameSession,
    sendMessage,
    handleLogout,
    loadMessages,
  };
}
