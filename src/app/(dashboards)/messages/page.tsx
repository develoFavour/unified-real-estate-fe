"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { 
  ArrowLeft,
  Send, 
  Search, 
  MessageSquare, 
  MoreVertical,
  Check,
  CheckCheck,
  Circle
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

interface Conversation {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender: { id: string; email: string; profile: { full_name: string } };
  receiver: { id: string; email: string; profile: { full_name: string } };
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(initialUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<string | null>(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get<Conversation[]>(ENDPOINTS.MESSAGES.CONVERSATIONS);
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const token = Cookies.get("token");
    if (!userId || !token) {
      console.log("WS skipping: user or token missing", { user: !!userId, token: !!token });
      return;
    }

    const socket = new WebSocket(`${ENDPOINTS.MESSAGES.WS}?token=${token}`);
    
    socket.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {
      console.log("WebSocket Raw Data:", event.data);
      const data = JSON.parse(event.data);
      console.log("Parsed Message Data:", data);
      const currentChat = activeChatRef.current;
      
      // If message is for the current active chat, add to messages list
      if (currentChat === data.sender_id || currentChat === data.receiver_id) {
        console.log("Adding message to active chat:", currentChat);
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
      // Refresh conversations list
      fetchConversations();
    };

    socket.onclose = () => console.log("WebSocket Disconnected");

    return () => socket.close();
  }, [fetchConversations, userId]);

  const fetchHistory = async (otherUserID: string) => {
    try {
      const data = await api.get<Message[]>(ENDPOINTS.MESSAGES.HISTORY(otherUserID));
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChat) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchHistory(activeChat);
    }
  }, [activeChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const msg = await api.post<Message>(ENDPOINTS.MESSAGES.SEND, {
        receiver_id: activeChat,
        content: newMessage
      });
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setNewMessage("");
      fetchConversations();
    } catch {
      toast.error("Failed to send message");
    }
  };

  const getOtherUser = (conv: Conversation) => {
    if (!conv) return null;
    return conv.sender_id === user?.id ? conv.receiver : conv.sender;
  };

  const activeConversation = conversations.find(c => 
    c.sender_id === activeChat || c.receiver_id === activeChat
  );
  
  const activeUser = activeConversation ? getOtherUser(activeConversation) : null;

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center animate-pulse">
        <MessageSquare className="w-12 h-12 text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-112px)] lg:h-[calc(100vh-160px)] flex bg-white/[0.02] border border-white/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={cn(
        "w-full md:w-96 border-r border-white/5 flex-col bg-black/20",
        activeChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-5 sm:p-6 lg:p-8 border-b border-white/5">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 lg:mb-6 font-heading tracking-tight">Inbox</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-gray-700" />
              </div>
              <p className="text-gray-500 text-sm font-light">No conversations yet.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              if (!otherUser) return null;
              const isActive = activeChat === otherUser.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(otherUser.id)}
                  className={cn(
                    "w-full p-5 lg:p-6 flex items-start gap-4 transition-all hover:bg-white/5 text-left border-b border-white/[0.02]",
                    isActive ? "bg-white/[0.05] border-l-4 border-l-primary" : ""
                  )}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {otherUser.profile.full_name.charAt(0)}
                    </div>
                    <Circle className="absolute -bottom-1 -right-1 w-3 h-3 fill-green-500 text-black border-2 border-black" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className={cn("text-sm font-bold truncate", isActive ? "text-primary" : "text-white")}>
                        {otherUser.profile.full_name}
                      </h4>
                      <span className="text-[10px] text-gray-500 font-light">
                        {new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", !conv.is_read && conv.receiver_id === user?.id ? "text-white font-bold" : "text-gray-500 font-light")}>
                      {conv.content}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 flex-col bg-black/40 min-w-0",
        activeChat ? "flex" : "hidden md:flex"
      )}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 sm:p-5 lg:p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveChat(null)}
                  className="md:hidden h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-400"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={17} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold">
                  {activeUser?.profile.full_name.charAt(0) || "U"}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white tracking-tight truncate">
                    {activeUser?.profile.full_name || "New Conversation"}
                  </h4>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-green-500" /> Online
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 custom-scrollbar"
            >
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id || idx} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[86%] sm:max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed break-words",
                      isMine 
                        ? "bg-primary text-black rounded-tr-none font-medium" 
                        : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none font-light"
                    )}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-2">
                      <span className="text-[10px] text-gray-600 font-light">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && (
                        msg.is_read ? <CheckCheck size={12} className="text-primary" /> : <Check size={12} className="text-gray-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 sm:p-6 lg:p-8 border-t border-white/5 bg-white/[0.01]">
              <div className="relative">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 sm:py-5 pl-5 sm:pl-6 pr-14 sm:pr-16 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-700"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-black flex items-center justify-center hover:bg-primary-hover transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12 lg:p-20 space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-800">
              <MessageSquare size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Secure Messaging</h3>
              <p className="text-gray-500 text-sm max-w-sm font-light leading-relaxed">
                Start a conversation with agents or property owners. All communications are encrypted and professional.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
