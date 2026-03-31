interface Session {
  id: number;
  title: string;
}

interface SidebarProps {
  sessions: Session[];
  activeId: number | null;
  editingId: number | null;
  newTitle: string;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  onRename: (id: number) => void;
  setEditingId: (id: number | null) => void;
  setNewTitle: (title: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  sessions,
  activeId,
  editingId,
  newTitle,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  setEditingId,
  setNewTitle,
  onLogout
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <img src="./screenshots/mcp-ai-agent.png" alt="MCP Logo" style={{ height: "80px", width: "auto" }} />
        </h2>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <button className="new-chat-btn" onClick={onCreate}>+ New Chat</button>

      <div style={{ marginBottom: "5px", fontFamily: "cursive", fontSize: "16px", fontWeight: "bold" }}>
        💬 Your Chat History
      </div>

      <div className="session-list">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`session-item ${s.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            {editingId === s.id ? (
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => onRename(s.id)}
                onKeyDown={(e) => e.key === "Enter" && onRename(s.id)}
                autoFocus
              />
            ) : (
              <>
                <span>{s.title}</span>
                <div className="actions">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setNewTitle(s.title); }}>✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}>🗑</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
