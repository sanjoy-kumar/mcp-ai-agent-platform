interface InputBoxProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function InputBox({ input, setInput, onSend, disabled }: InputBoxProps) {
  return (
    <div className="chat-input-container">
      <input
        className="chat-input"
        value={input}
        placeholder="Ask anything..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        disabled={disabled}
      />
      <button 
        className="chat-button" 
        onClick={onSend} 
        style={{ marginRight: "20px" }}
        disabled={disabled || !input.trim()}
      >
        Send
      </button>
    </div>
  );
}
