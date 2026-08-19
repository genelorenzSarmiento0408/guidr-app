"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import TopNavbar from "./TopNavbar";
import Footer from "./Footer";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_mime?: string | null;
  attachment_size?: number | null;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
    photo_url: string;
    last_active?: string | null;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ConversationRow {
  id: string;
  participant1_id: string;
  participant2_id: string;
  updated_at: string;
  p1:
    | {
        id: string;
        username: string;
        photo_url: string;
        last_active?: string | null;
      }
    | {
        id: string;
        username: string;
        photo_url: string;
        last_active?: string | null;
      }[]
    | null;
  p2:
    | {
        id: string;
        username: string;
        photo_url: string;
        last_active?: string | null;
      }
    | {
        id: string;
        username: string;
        photo_url: string;
        last_active?: string | null;
      }[]
    | null;
}

function normalizeProfileRef(
  ref:
    | {
        id: string;
        username: string;
        photo_url: string;
        last_active?: string | null;
      }
    | {
        id: string;
        username: string;
        photo_url: string;
        last_active?: string | null;
      }[]
    | null,
) {
  if (Array.isArray(ref)) {
    return ref[0] || null;
  }
  return ref;
}

export default function MessagesClient({
  userProfile,
}: {
  userProfile: { id: string; username: string; photo_url?: string };
}) {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isDragOverComposer, setIsDragOverComposer] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());
  const ACTIVE_WINDOW_MINUTES = 5;
  const activeWindowMs = ACTIVE_WINDOW_MINUTES * 60 * 1000;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const isUserActive = (lastActive?: string | null) => {
    if (!lastActive) return false;
    const last = new Date(lastActive).getTime();
    if (Number.isNaN(last)) return false;
    return currentTimeMs - last <= activeWindowMs;
  };

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
        p1:profiles!participant1_id(id, username, photo_url, last_active),
        p2:profiles!participant2_id(id, username, photo_url, last_active)
      `,
      )
      .or(
        `participant1_id.eq.${userProfile.id},participant2_id.eq.${userProfile.id}`,
      )
      .order("updated_at", { ascending: false });

    let formattedConversations: Conversation[] = [];
    if (convos) {
      const conversationRows = convos as unknown as ConversationRow[];
      const conversationsWithPreview = await Promise.all(
        conversationRows.map(async (conv) => {
          const { data: latestMessage } = await supabase
            .from("messages")
            .select("content, attachment_name, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return { conv, latestMessage };
        }),
      );

      formattedConversations = conversationsWithPreview.map(
        ({ conv, latestMessage }) => {
          const isUser1 = conv.participant1_id === userProfile.id;
          const otherUser = normalizeProfileRef(isUser1 ? conv.p2 : conv.p1);

          let preview = "No messages yet";
          if (latestMessage?.attachment_name && latestMessage?.content) {
            preview = `📎 ${latestMessage.attachment_name} • ${latestMessage.content}`;
          } else if (latestMessage?.attachment_name) {
            preview = `📎 ${latestMessage.attachment_name}`;
          } else if (latestMessage?.content) {
            preview = latestMessage.content;
          }

          return {
            id: conv.id,
            otherUser: {
              id: otherUser?.id || "",
              username: otherUser?.username || "Unknown",
              photo_url: otherUser?.photo_url || "",
              last_active: otherUser?.last_active || null,
            },
            lastMessage: preview,
            lastMessageTime: latestMessage?.created_at || conv.updated_at,
          };
        },
      );
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
        .select(
          "id, sender_id, content, created_at, attachment_url, attachment_name, attachment_mime, attachment_size",
        )
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    },
    [supabase],
  );

  useEffect(() => {
    void Promise.resolve().then(() => fetchConversations());
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      void Promise.resolve().then(() => fetchMessages(activeConversationId));
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
            setMessages((prev) => {
              const incoming = payload.new as Message;
              if (prev.some((item) => item.id === incoming.id)) {
                return prev;
              }
              return [...prev, incoming];
            });
            fetchConversations();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeConversationId, fetchMessages, fetchConversations, supabase]);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachmentFile = (file: File | null) => {
    setSendError(null);

    if (!file) {
      setSelectedAttachment(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSendError("Attachment exceeds 10MB limit.");
      setSelectedAttachment(null);
      return;
    }

    setSelectedAttachment(file);
  };

  const handleAttachmentSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] || null;
    handleAttachmentFile(file);
  };

  const handleComposerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOverComposer) {
      setIsDragOverComposer(true);
    }
  };

  const handleComposerDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragOverComposer(false);
    }
  };

  const handleComposerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverComposer(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleAttachmentFile(file);
  };

  const clearAttachment = () => {
    setSelectedAttachment(null);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !userProfile?.id) return;

    const messageContent = newMessage.trim();
    if (!messageContent && !selectedAttachment) return;

    setSendError(null);
    setSending(true);

    const optimisticText = messageContent;
    const attachment = selectedAttachment;

    setNewMessage("");
    setSelectedAttachment(null);

    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;
    let attachmentMime: string | null = null;
    let attachmentSize: number | null = null;

    if (attachment) {
      setUploadingAttachment(true);
      const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${activeConversationId}/${userProfile.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("message-attachments")
        .upload(filePath, attachment, {
          upsert: false,
        });

      if (uploadError) {
        setUploadingAttachment(false);
        setSending(false);
        setNewMessage(optimisticText);
        setSelectedAttachment(attachment);
        setSendError(uploadError.message || "Failed to upload attachment.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("message-attachments").getPublicUrl(filePath);

      attachmentUrl = publicUrl;
      attachmentName = attachment.name;
      attachmentMime = attachment.type || null;
      attachmentSize = attachment.size;
      setUploadingAttachment(false);
    }

    const { data: sentMessage, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        sender_id: userProfile.id,
        content: messageContent,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_mime: attachmentMime,
        attachment_size: attachmentSize,
      })
      .select()
      .single();

    if (sentMessage && !error) {
      setMessages((prev) => {
        // Prevent duplicate if realtime socket already pushed it
        if (prev.some((m) => m.id === sentMessage.id)) return prev;
        return [...prev, sentMessage as Message];
      });
      fetchConversations();
    }

    if (error) {
      setSendError(error.message || "Failed to send message.");
      setNewMessage(optimisticText);
      if (attachment) {
        setSelectedAttachment(attachment);
      }
    }

    // Also update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeConversationId);

    setSending(false);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      conv.otherUser.username.toLowerCase().includes(q) ||
      (conv.lastMessage || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#060806] font-['Inter',sans-serif] w-full relative">
      <TopNavbar
        currentUserId={userProfile?.id}
        currentUserProfile={userProfile}
      />

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
            {filteredConversations.map((conv) => (
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
                    {isUserActive(conv.otherUser.last_active) && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-[#1A1A1A]" />
                    )}
                  </div>
                  <span className="font-['Inter',sans-serif] font-bold text-left line-clamp-1">
                    {conv.otherUser.username || "Unknown"}
                  </span>
                  <span className="text-xs text-gray-400 line-clamp-1">
                    {conv.lastMessage}
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
                      {isUserActive(activeConvo?.otherUser.last_active) && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-[#1A1A1A]" />
                      )}
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
                          {message.content && (
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}
                          {message.attachment_url && (
                            <div className={message.content ? "mt-3" : ""}>
                              {message.attachment_mime?.startsWith("image/") ? (
                                <a
                                  href={message.attachment_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block"
                                >
                                  <Image
                                    src={message.attachment_url}
                                    alt={
                                      message.attachment_name || "Attachment"
                                    }
                                    width={260}
                                    height={180}
                                    className="rounded-xl border border-white/10 object-cover"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={message.attachment_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-lg border border-[#228c1d]/50 bg-[#228c1d]/10 px-3 py-2 text-sm text-[#9cf996] hover:bg-[#228c1d]/20"
                                >
                                  <span>📎</span>
                                  <span className="truncate max-w-[220px]">
                                    {message.attachment_name ||
                                      "Download attachment"}
                                  </span>
                                  <span className="text-xs text-[#84e07e]">
                                    {formatFileSize(message.attachment_size)}
                                  </span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Box shrink-0 */}
              <form onSubmit={sendMessage} className="relative mt-4 shrink-0">
                {sendError && (
                  <div className="mb-3 rounded-xl border border-red-600/50 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                    {sendError}
                  </div>
                )}
                <div
                  onDragOver={handleComposerDragOver}
                  onDragEnter={handleComposerDragOver}
                  onDragLeave={handleComposerDragLeave}
                  onDrop={handleComposerDrop}
                  className={`relative rounded-full transition-all ${isDragOverComposer ? "ring-2 ring-[#228c1d]" : ""}`}
                >
                  {isDragOverComposer && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-full border border-[#228c1d]/60 bg-[#228c1d]/15 text-xs font-semibold uppercase tracking-wider text-[#9cf996]">
                      Drop attachment to upload
                    </div>
                  )}
                  {selectedAttachment && (
                    <div className="mb-3 inline-flex items-center gap-3 rounded-full border border-[#228c1d]/40 bg-[#228c1d]/10 px-4 py-2 text-xs text-[#9cf996]">
                      <span className="truncate max-w-[280px]">
                        📎 {selectedAttachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={clearAttachment}
                        className="text-white/80 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-[#2A2A2A] text-white p-6 pr-36 rounded-full focus:outline-none focus:ring-1 focus:ring-[#228c1d] font-['Inter',sans-serif]"
                  />
                  <label className="absolute right-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[#228c1d] text-[#9cf996] flex items-center justify-center cursor-pointer hover:bg-[#228c1d]/15 transition-colors">
                    📎
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentSelection}
                      accept="image/*,.pdf,.txt,.docx"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={
                      sending ||
                      uploadingAttachment ||
                      (!newMessage.trim() && !selectedAttachment)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#228c1d] rounded-full flex items-center justify-center hover:bg-[#1d7518] transition-colors disabled:opacity-50"
                  >
                    {sending || uploadingAttachment ? (
                      <span className="text-xs font-bold">...</span>
                    ) : (
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
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer year={2025} />
    </div>
  );
}
