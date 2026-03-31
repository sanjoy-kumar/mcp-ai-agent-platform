import "./Chat.css";
import ChatBox from "../components/ChatBox";
import InputBox from "../components/InputBox";
import Sidebar from "../components/Sidebar";
import { useChat } from "../hooks/useChat";

export default function Chat() {
  const {
    sessions, activeId, setActiveId, input, setInput, loading, editingId, setEditingId,
    newTitle, setNewTitle, bottomRef, activeSession, createNewChat, deleteSession,
    renameSession, sendMessage, handleLogout, loadMessages
  } = useChat();

  return (
    <div className="layout">
      <Sidebar 
        sessions={sessions}
        activeId={activeId}
        editingId={editingId}
        newTitle={newTitle}
        onSelect={(id) => { setActiveId(id); loadMessages(id); }}
        onCreate={createNewChat}
        onDelete={deleteSession}
        onRename={renameSession}
        setEditingId={setEditingId}
        setNewTitle={setNewTitle}
        onLogout={handleLogout}
      />

      <div className="chat-container">
        <div className="chat-header">
          🤖 MCP AI Agent Platform
          <h3 style={{ fontSize: "14px" }}>A unified platform for intelligent AI agents and tool orchestration.</h3>
        </div>

        <ChatBox 
          messages={activeSession?.messages || []} 
          loading={loading} 
          bottomRef={bottomRef} 
        />

        <InputBox 
          input={input} 
          setInput={setInput} 
          onSend={sendMessage} 
          disabled={loading || !activeId} 
        />
      </div>
    </div>
  );
}
