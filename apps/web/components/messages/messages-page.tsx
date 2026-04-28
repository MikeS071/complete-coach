"use client";

import { MessageSquare, MoreVertical, Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react";
import { useState } from "react";
import { conversations, initialConversationMessages, type ChatMessage } from "@/fixtures/operations";

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]?.id ?? "");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesByConversation, setMessagesByConversation] = useState(initialConversationMessages);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentConversation = conversations.find((conversation) => conversation.id === selectedConversation);
  const currentMessages = messagesByConversation[selectedConversation] ?? [];

  function sendMessage() {
    const text = messageInput.trim();
    if (!text) {
      return;
    }

    const message: ChatMessage = {
      id: `${selectedConversation}-${Date.now()}`,
      sender: "coach",
      text,
      time: "Now"
    };
    setMessagesByConversation({
      ...messagesByConversation,
      [selectedConversation]: [...currentMessages, message]
    });
    setMessageInput("");
  }

  return (
    <main className="flex h-[calc(100vh-88px)] min-h-[720px] overflow-hidden">
      <aside className="flex w-full max-w-sm flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h1 className="mb-4 text-2xl font-black">Messages</h1>
          <label className="relative block">
            <span className="sr-only">Search conversations</span>
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              aria-label={`Open conversation with ${conversation.name}`}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition ${
                selectedConversation === conversation.id ? "border-l-4 border-l-indigo-600 bg-indigo-50" : "hover:bg-slate-50"
              }`}
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-black text-white">
                {conversation.initials}
                {conversation.online ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black">{conversation.name}</span>
                  <span className="shrink-0 text-xs text-slate-500">{conversation.time}</span>
                </span>
                <span className="block truncate text-sm text-slate-600">{conversation.lastMessage}</span>
              </span>
              {conversation.unread > 0 ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {conversation.unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col bg-slate-50">
        {currentConversation ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-black text-white">
                  {currentConversation.initials}
                  {currentConversation.online ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" /> : null}
                </span>
                <div>
                  <h2 className="font-black">{currentConversation.name}</h2>
                  <p className="text-xs text-slate-500">{currentConversation.online ? "Active now" : "Offline"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button aria-label="Start phone call" className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100">
                  <Phone className="h-5 w-5" />
                </button>
                <button aria-label="Start video call" className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100">
                  <Video className="h-5 w-5" />
                </button>
                <button aria-label="Conversation actions" className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div role="log" aria-label={`Conversation with ${currentConversation.name}`} className="flex-1 space-y-4 overflow-y-auto p-6">
              {currentMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "coach" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 ${
                      message.sender === "coach"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`mt-1 text-xs ${message.sender === "coach" ? "text-indigo-200" : "text-slate-500"}`}>{message.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-end gap-3">
                <button aria-label="Attach file" className="shrink-0 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100">
                  <Paperclip className="h-5 w-5" />
                </button>
                <label className="relative flex-1">
                  <span className="sr-only">Type a message</span>
                  <textarea
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="button" aria-label="Open emoji picker" className="absolute bottom-3 right-3 rounded-lg p-1 text-slate-600 transition hover:bg-slate-100">
                    <Smile className="h-5 w-5" />
                  </button>
                </label>
                <button
                  type="button"
                  aria-label="Send message"
                  onClick={sendMessage}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
