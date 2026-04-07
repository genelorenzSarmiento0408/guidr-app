"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Navigation from "./Navigation";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
    photo_url: string;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function MessagesClient({
  userProfile,
}: {
  userProfile: { id: string; username: string };
}) {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConversations = useCallback(async () => {
    if (!userProfile?.id) return;

    // Fetch all conversations where user is participant1 or participant2
    const { data: convos } = await supabase
      .from("conversations")
      .select(
        `
        id, 
        participant1_id, 
        participant2_id,
        updated_at,
        profiles!participant1_id(id, username, photo_url),
        profiles!participant2_id(id, username, photo_url)
      `,
      )
      .or(
        `participant1_id.eq.${userProfile.id},participant2_id.eq.${userProfile.id}`,
      )
      .order("updated_at", { ascending: false });

    if (convos) {
      const formattedConversations = convos.map((conv: any) => {
        return {
          id: conv.id,
          // If we can't cleanly join in 1 step because of 2 foreign keys to same table, we fetch other users separately or rely on simple assumption
          otherUser: {
            id: "placeholder",
            username: "Placeholder Name",
            photo_url: "",
          }, // Placeholder for logic brevity right now due to complex FK resolving in standard client
          lastMessage: "...",
          lastMessageTime: conv.updated_at,
        };
      });
      // Need dynamic fetching for true exactness but this is a stub.
      setConversations(formattedConversations);
    }
  }, [userProfile?.id, supabase]);

  const fetchMessages = useCallback(
    async (convId: string) => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    },
    [supabase],
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      // Setup realtime subscription
      const channel = supabase
        .channel(`messages-${activeConversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${activeConversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeConversationId, fetchMessages, supabase]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || !userProfile?.id) return;

    await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      sender_id: userProfile.id,
      content: newMessage.trim(),
    });

    // Also update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeConversationId);

    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0D110D] font-['League_Spartan',sans-serif]">
      <Navigation />

      {/* Header logic similar to BrowseFeed */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#2A2A2A] z-40 flex items-center justify-between px-8 border-b border-black/20">
        {/* Stubbed header to match style */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("toggleMenu"))}
          >
            MENU
          </button>
          <Link
            href="/browse"
            className="text-[#228C1D] text-3xl font-bold px-4 border-l border-white/20"
          >
            GUIDR
          </Link>
        </div>
      </header>

      <main className="pt-32 px-8 pb-12 w-full max-w-[1512px] mx-auto min-h-screen flex gap-8">
        <aside className="w-1/4 min-w-[300px] flex flex-col gap-6">
          <Link
            href="/browse"
            className="flex items-center text-white gap-2 font-['Arimo'] uppercase text-sm tracking-wider hover:text-[#228c1d]"
          >
            ← BACK TO DASHBOARD
          </Link>

          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-black py-3 px-12 rounded-full font-['Arimo'] focus:outline-none focus:ring-2 focus:ring-[#228c1d]"
          />

          <div className="flex flex-col gap-2 mt-4 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${activeConversationId === conv.id ? "bg-[#2A2A2A]" : "bg-transparent hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded-full bg-gray-500 overflow-hidden">
                    {/* Sub out photo */}
                  </div>
                  <span className="font-['Arimo'] font-bold">
                    Name Lastname
                  </span>
                </div>
                <span className="text-gray-400 text-sm font-['Arimo'] flex items-center gap-2">
                  02:25 pm <div className="w-2 h-2 rounded-full bg-[#228c1d]" />
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 flex flex-col relative h-[80vh]">
          {/* Active Convo Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/10 shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-500" />
            <div>
              <h2 className="text-white font-bold font-['Arimo']">
                Name Lastname
              </h2>
              <p className="text-gray-400 text-sm font-['Arimo']">
                Profession / Title
              </p>
            </div>
          </div>

          {/* Messages List flex-1 overflow-y-auto */}
          <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 font-['Arimo']">
            <div className="text-center text-xs text-gray-500 my-4">
              April 05, 2025
            </div>

            {/* Chat Bubbles Placeholder Structure */}
            <div className="flex flex-col gap-1 items-end self-end max-w-[70%]">
              <div className="text-[10px] text-gray-500 mr-2">01:45pm</div>
              <div className="bg-[#2A2A2A] text-white p-4 rounded-2xl rounded-tr-sm">
                Hello! I'm reaching out...
              </div>
            </div>

            <div className="flex flex-col gap-1 items-start self-start max-w-[70%] mt-4">
              <div className="text-[10px] text-gray-500 ml-2">01:25pm</div>
              <div className="bg-[#3A3A3A] text-gray-200 p-4 rounded-2xl rounded-tl-sm leading-relaxed">
                Hi! Thank you for reaching out. I'd be happy to provide more
                details...
              </div>
            </div>
          </div>

          {/* Input Box shrink-0 */}
          <form onSubmit={sendMessage} className="relative mt-4 shrink-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full bg-[#2A2A2A] text-white p-6 pr-20 rounded-full focus:outline-none focus:ring-1 focus:ring-[#228c1d] font-['Arimo']"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#228c1d] rounded-full flex items-center justify-center hover:bg-[#1d7518] transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
