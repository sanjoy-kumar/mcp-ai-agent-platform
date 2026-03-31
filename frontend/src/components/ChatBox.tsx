import ReactMarkdown from "react-markdown";
interface Message {
  role: "user" | "assistant";
  text: string;
  tools?: string[];
}
interface ChatBoxProps {
  messages: Message[];
  loading: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatBox({ messages, loading, bottomRef }: ChatBoxProps) {
  const renderToolTag = (tool: string) => {
    const toolsMap: Record<string, string> = {
      web_search: "🌐 Web Search",
      rag_search: "📄 Document RAG",
      query_db: "🗄 Database",
      get_weather: "🌤 Weather",
      get_stock_price: "📈 Stocks",
      read_file: "📁 File Reader",
      index_pdf: "⚙️ PDF Indexer",
      analyze_sentiment: "🎭 Sentiment",
      calculate: "🔢 Calculator",
      health_check: "🩺 System Health",
    };

    return toolsMap[tool] || `🛠 ${tool}`;
  };

  return (
    <div className="chat-box">
      {messages.map((msg, i) => (
        <div key={i} className={`chat-message ${msg.role}`}> 
         <ReactMarkdown>{msg.text}</ReactMarkdown>
          {msg.tools && msg.tools.filter(t => t !== 'agent').length > 0 && (
            <div className="tool-box">
              <span className="tool-label">Tools(🔧) Used: ▶ </span>
              {msg.tools
                .filter((tool) => tool !== "agent")
                .map((tool) => (
                  <span className="tool-tag" key={tool}>
                    {renderToolTag(tool)}
                  </span>
                ))}
            </div>
          )}
        </div>
      ))}

      {loading && <div className="chat-message assistant">Thinking...</div>}
      <div ref={bottomRef} />
    </div>
  );
}

