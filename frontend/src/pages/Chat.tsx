import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import "./Chat.css";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  text: string;
  tools?: string[]; 
}
interface Session {
  id: number;
  title: string;
  messages: Message[];
}

export default function Chat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeSession = sessions.find((s) => s.id === activeId);

  // 🔹 Load sessions on start
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await API.get("/chat/sessions");

      const sessionsWithMessages = res.data.map((s: any) => ({
        ...s,
        messages: []
      }));

      setSessions(sessionsWithMessages);

      if (sessionsWithMessages.length > 0) {
        setActiveId(sessionsWithMessages[0].id);
        loadMessages(sessionsWithMessages[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renameSession = async (id: number) => {
    try {
        await API.put(`/chat/session/${id}`, {
        title: newTitle
        });

        setSessions((prev) =>
        prev.map((s) =>
            s.id === id ? { ...s, title: newTitle } : s
        )
        );

        setEditingId(null);
    } catch (err) {
        console.error(err);
    }
  };

  const deleteSession = async (id: number) => {
    try {
        await API.delete(`/chat/session/${id}`);

        const updated = sessions.filter((s) => s.id !== id);
        setSessions(updated);

        // switch to another session
        if (updated.length > 0) {
        setActiveId(updated[0].id);
        } else {
        setActiveId(null);
        }

    } catch (err) {
        console.error(err);
    }
  };

  const loadMessages = async (sessionId: number) => {
    try {
      const res = await API.get(`/chat/messages/${sessionId}`);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, messages: res.data } : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Create new session
  const createNewChat = async () => {
    try {
      const res = await API.post("/chat/session");

      const newSession: Session = {
        id: res.data.session_id,
        title: "New Chat",
        messages: []
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveId(newSession.id);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSession = (id: number, messages: Message[]) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, messages } : s))
    );
  };

  const updateTitle = (id: number, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !activeSession) return;

    const userMessage: Message = { role: "user", text: input };
    const generateTitle = (text: string) => {
        return text.length > 30 ? text.substring(0, 30) + "..." : text;
    };

    const isFirstMessage = activeSession.messages.length === 0;

    if (isFirstMessage) {
        const newTitle = generateTitle(input);

        // update frontend UI
        updateTitle(activeSession.id, newTitle);

        // send to backend
        await API.put(`/chat/session/${activeSession.id}`, {
            title: newTitle
        });
    }

    updateSession(activeSession.id, [
      ...activeSession.messages,
      userMessage
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chat/send", {
        query: input,
        session_id: activeSession.id
      });

      const botMessage: Message = {
            role: "assistant",
            text: res.data.result,
            tools: res.data.tools
        };
      updateSession(activeSession.id, [
        ...activeSession.messages,
        userMessage,
        botMessage
      ]);
      
      if (isFirstMessage) {
        updateTitle(
          activeSession.id,
          input.length > 30 ? input.substring(0, 30) + "..." : input
        );
      }

    } catch (err: any) {
      updateSession(activeSession.id, [
        ...activeSession.messages,
        userMessage,
        { role: "assistant", text: "Error: " + err.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions]);

  return (
    <div className="layout">
      <div className="sidebar">

        <div className="sidebar-header">
        <h2 className="sidebar-title"><img src="./screenshots/mcp-ai-agent.png" alt="MCP Logo" style={{height: "80px", width: "auto"}} /></h2>
 
        <button
            className="logout-btn"
            onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
            }}
        >
            Logout
        </button>
        </div>

        <button className="new-chat-btn" onClick={createNewChat}>
          + New Chat
        </button>

       <div style={{marginBottom: "5px", fontFamily: "cursive", fontSize: "16px", fontWeight: "bold"}}>💬 Your Chat History</div>

        <div className="session-list">
          {sessions.map((s) => (

            <div
                key={s.id}
                className={`session-item ${s.id === activeId ? "active" : ""}`}
                onClick={() => {
                    setActiveId(s.id);
                    loadMessages(s.id);
                }}
                >

                {editingId === s.id ? (
                    <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => renameSession(s.id)}
                    onKeyDown={(e) => e.key === "Enter" && renameSession(s.id)}
                    autoFocus
                    />
                ) : (
                    <>
                <span>{s.title}</span>

                <div className="actions">
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(s.id);
                        setNewTitle(s.title);
                    }}
                    >
                    ✏️
                    </button>

                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s.id);
                    }}
                    >
                    🗑
                    </button>
            </div>
            </>
        )}
        </div>

          ))}
        </div>

      </div>

      {/* Chat Area */}
      <div className="chat-container">

        <div className="chat-header">
          🤖 MCP AI Agent Platform
        <h3 style={{fontSize:"14px"}}>A unified platform for intelligent AI agents and tool orchestration.</h3>
        </div>     
        
        <div className="chat-box">
          {activeSession?.messages.map((msg, i) => (

                <div key={i} className={`chat-message ${msg.role}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>

                {msg.tools && msg.tools.length > 0 && (
                <div className="tool-box">
                    <span className="tool-label">🔧 Tools: </span>
                    {msg.tools
                        .filter(tool => tool !== 'agent') // Hide the orchestrator itself
                        .map((tool) => (
                            <span className="tool-tag" key={tool}>
                                {/* Real-time & Data Tools */}
                                {tool === "web_search" && "🌐 Web Search"}
                                {tool === "rag_search" && "📄 Document RAG"}
                                {tool === "query_db" && "🗄 Database"}
                                {tool === "get_weather" && "🌤 Weather"}
                                {tool === "get_stock_price" && "📈 Stocks"}
                                
                                {/* File & Content Tools */}
                                {tool === "read_file" && "📁 File Reader"}
                                {tool === "index_pdf" && "⚙️ PDF Indexer"}
                                {tool === "analyze_sentiment" && "🎭 Sentiment"}
                                
                                {/* Utility Tools */}
                                {tool === "calculate" && "🔢 Calculator"}
                                {tool === "health_check" && "🩺 System Health"}
                                
                                {/* Fallback for unknown tools */}
                                {!["web_search", "rag_search", "query_db", "get_weather", "get_stock_price", "read_file", "index_pdf", "analyze_sentiment", "calculate", "health_check"].includes(tool) && `🛠 ${tool}`}
                            </span>
                    ))}
                </div>
                )}
                            
                </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="chat-input-container">
          <input
            className="chat-input"
            value={input}
            placeholder="Ask anything..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button className="chat-button" onClick={sendMessage} style={{marginRight:"20px"}}>
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
