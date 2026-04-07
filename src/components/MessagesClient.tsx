"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  userProfile: { id: string; username: string; photo_url?: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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
        p1:profiles!participant1_id(id, username, photo_url),
        p2:profiles!participant2_id(id, username, photo_url)
      `,
      )
      .or(
        `participant1_id.eq.${userProfile.id},participant2_id.eq.${userProfile.id}`,
      )
      .order("updated_at", { ascending: false });

    let formattedConversations: Conversation[] = [];
    if (convos) {
      formattedConversations = convos.map((conv: any) => {
        const isUser1 = conv.participant1_id === userProfile.id;
        const otherUser = isUser1 ? conv.p2 : conv.p1;

        return {
          id: conv.id,
          otherUser: {
            id: otherUser?.id || "placeholder",
            username: otherUser?.username || "Unknown",
            photo_url: otherUser?.photo_url || "",
          },
          lastMessage: "...",
          lastMessageTime: conv.updated_at,
        };
      });
    }

    // Process ?user= parameter only once natively when setting initial active convo
    const searchParams = new URLSearchParams(window.location.search);
    const targetUserId = searchParams.get("user");

    if (targetUserId && targetUserId !== userProfile.id) {
      const existingConv = formattedConversations.find(
        (c) => c.otherUser.id === targetUserId,
      );

      if (!existingConv) {
        const { data: targetProfile } = await supabase
          .from("profiles")
          .select("id, username, photo_url")
          .or(`id.eq.${targetUserId},user_id.eq.${targetUserId}`)
          .single();

        if (targetProfile) {
          const realExistingConv = formattedConversations.find(
            (c) => c.otherUser.id === targetProfile.id,
          );

          if (realExistingConv) {
            setActiveConversationId(realExistingConv.id);
          } else {
            const { data: newConv, error } = await supabase
              .from("conversations")
              .insert({
                participant1_id: userProfile.id,
                participant2_id: targetProfile.id,
              })
              .select()
              .single();

            if (newConv && !error) {
              formattedConversations.unshift({
                id: newConv.id,
                otherUser: targetProfile,
                lastMessage: "Say hi!",
                lastMessageTime: newConv.updated_at,
              });
              setActiveConversationId(newConv.id);
            }
          }
        }
      } else {
        setActiveConversationId(existingConv.id);
      }
      // Remove ?user from browser URL to prevent lock-in
      window.history.replaceState(null, "", "/messages");
    } else if (formattedConversations.length > 0 && !activeConversationId) {
      // Default to first conversation if none selected
      setActiveConversationId(
        activeConversationId || formattedConversations[0].id,
      );
    }

    setConversations(formattedConversations);
  }, [userProfile, supabase, activeConversationId]);

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

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear early for better UX

    const { data: sentMessage, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        sender_id: userProfile.id,
        content: messageContent,
      })
      .select()
      .single();

    if (sentMessage && !error) {
      setMessages((prev) => {
        // Prevent duplicate if realtime socket already pushed it
        if (prev.some((m) => m.id === sentMessage.id)) return prev;
        return [...prev, sentMessage as Message];
      });
    }

    // Also update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeConversationId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060806] font-['Inter',sans-serif] w-full relative">
      <Navigation />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 px-6 h-20 flex items-center justify-between bg-transparent pointer-events-auto border-b border-[#173715]/20">
        {/* Left: Menu Button */}
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
            window.dispatchEvent(new Event("toggleMenu"));
          }}
          className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="text-sm font-['Inter',sans-serif] font-bold">
            MENU
          </span>
        </button>

        {/* Center: Logo and Tagline */}
        <div className="flex items-center gap-3">
          <Link
            href="/browse"
            className="text-3xl font-['Inter',sans-serif] font-bold text-[#228C1D]"
          >
            GUIDR
          </Link>
          <span className="text-white text-sm font-['Inter',sans-serif]">
            | Guided By Purpose. Driven By People
          </span>
        </div>

        {/* Right: Messages and Profile */}
        <div className="flex items-center gap-6 font-['Inter',sans-serif]">
          <button
            onClick={() => router.push("/messages")}
            className="text-[#228c1d] text-sm font-bold transition-colors"
          >
            Messages
          </button>
          <button
            onClick={() =>
              userProfile?.id && router.push(`/profile/${userProfile.id}`)
            }
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden relative">
              {userProfile?.photo_url ? (
                <Image
                  src={userProfile.photo_url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[#0d110d] font-bold">
                  {userProfile?.username?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <span className="text-white font-bold text-sm">
              {userProfile?.username || "Profile"}
            </span>
          </button>
        </div>
      </header>

      <main className="pt-32 px-8 pb-12 w-full max-w-[1512px] flex-1 mx-auto flex gap-8">
        <aside className="w-1/4 min-w-[300px] flex flex-col gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          <Link
            href="/browse"
            className="flex items-center text-white gap-2 font-['Inter',sans-serif] uppercase text-sm tracking-wider hover:text-[#228c1d]"
          >
            ← BACK TO DASHBOARD
          </Link>

          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-black py-3 px-12 rounded-full font-['Inter',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#228c1d]"
          />

          <div className="flex flex-col gap-2 mt-4 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${activeConversationId === conv.id ? "bg-[#2A2A2A]" : "bg-transparent hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded-full bg-gray-500 overflow-hidden relative">
                    {conv.otherUser.photo_url ? (
                      <Image
                        src={conv.otherUser.photo_url}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <span className="font-['Inter',sans-serif] font-bold text-left line-clamp-1">
                    {conv.otherUser.username || "Unknown"}
                  </span>
                </div>
                <span className="text-gray-400 text-xs font-['Inter',sans-serif] flex items-center gap-2 shrink-0">
                  {conv.lastMessageTime
                    ? new Date(conv.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 flex flex-col relative h-[calc(100vh-250px)] min-h-[500px]">
          {!activeConversationId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-['Inter',sans-serif]">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              {/* Active Convo Header */}
              {(() => {
                const activeConvo = conversations.find(
                  (c) => c.id === activeConversationId,
                );
                return (
                  <div className="flex items-center gap-4 pb-6 border-b border-white/10 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-500 overflow-hidden relative">
                      {activeConvo?.otherUser.photo_url ? (
                        <Image
                          src={activeConvo.otherUser.photo_url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <h2 className="text-white font-bold font-['Inter',sans-serif]">
                        {activeConvo?.otherUser.username || "Unknown User"}
                      </h2>
                      <p className="text-gray-400 text-sm font-['Inter',sans-serif]">
                        Mentor / Organization
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Messages List flex-1 overflow-y-auto */}
              <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 font-['Inter',sans-serif]">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 my-4">
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender_id === userProfile.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col gap-1 max-w-[70%] ${
                          isMe ? "items-end self-end" : "items-start self-start"
                        }`}
                      >
                        <div
                          className={`text-[10px] text-gray-500 ${isMe ? "mr-2" : "ml-2"}`}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div
                          className={`p-4 rounded-2xl leading-relaxed ${
                            isMe
                              ? "bg-[#2A2A2A] text-white rounded-tr-sm"
                              : "bg-[#3A3A3A] text-gray-200 rounded-tl-sm"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Box shrink-0 */}
              <form onSubmit={sendMessage} className="relative mt-4 shrink-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-[#2A2A2A] text-white p-6 pr-20 rounded-full focus:outline-none focus:ring-1 focus:ring-[#228c1d] font-['Inter',sans-serif]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#228c1d] rounded-full flex items-center justify-center hover:bg-[#1d7518] transition-colors disabled:opacity-50"
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
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-12 px-8 mt-auto shrink-0 border-t-2 border-[#20401d]"
        style={{
          background:
            "radial-gradient(ellipse at bottom, #273D20 0%, #173715 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <h2 className="text-4xl font-bold font-['Inter',sans-serif] text-white tracking-widest">
            GUIDR
          </h2>

          <div className="flex justify-center gap-8 text-white/80 text-sm font-['Inter',sans-serif]">
            <Link
              href="/support"
              className="hover:text-[#228C1D] transition-colors"
            >
              Support
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#228C1D] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#228C1D] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          <div className="text-white/60 text-sm font-['Inter',sans-serif]">
            Copyright © 2026 GUIDR®. All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
