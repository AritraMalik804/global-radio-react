import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: number;
}

export const Chat = () => {
  const { currentStation, theme } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('Listener');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Retrieve or set random username
    let storedName = localStorage.getItem('global_radio_username');
    if (!storedName) {
      storedName = `Listener_${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem('global_radio_username', storedName);
    }
    setUsername(storedName);
  }, []);

  const fetchMessages = async () => {
    if (!currentStation || !isOpen) return;
    try {
      const res = await fetch(`/.netlify/functions/getMessages?stationId=${encodeURIComponent(currentStation.id)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  useEffect(() => {
    setMessages([]);
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [currentStation?.id, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentStation) return;
    
    const msgText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: Date.now().toString(),
      text: msgText,
      username,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/.netlify/functions/postMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: currentStation.id,
          message: msgText,
          username
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentStation) return;
    
    // Optimistic UI update
    setMessages(prev => prev.filter(msg => msg.id !== messageId));

    try {
      const res = await fetch('/.netlify/functions/deleteMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: currentStation.id,
          messageId,
          username
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Failed to delete message', e);
      fetchMessages();
    }
  };

  if (!currentStation) return null;

  return (
    <div className={`chat-widget ${isOpen ? 'open' : ''} ${theme}`}>
      <button 
        className="chat-toggle glass-panel" 
        onClick={() => setIsOpen(!isOpen)}
        title="Station Chat"
      >
        <MessageSquare size={20} />
      </button>

      {isOpen && (
        <div className="chat-container glass-panel">
          <div className="chat-header">
            <h4>Live Chat: {currentStation.name}</h4>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="no-messages">Be the first to say hello!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`chat-message ${msg.username === username ? 'own' : ''}`}>
                  <span className="chat-username">{msg.username}</span>
                  <div className="chat-bubble-container">
                    <p className="chat-text">{msg.text}</p>
                    {msg.username === username && (
                      <button 
                        className="delete-msg-btn"
                        onClick={() => deleteMessage(msg.id)}
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-form">
            <input 
              type="text" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
              placeholder="Join the conversation..."
              disabled={isLoading}
            />
            <button type="submit" disabled={!newMessage.trim() || isLoading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
