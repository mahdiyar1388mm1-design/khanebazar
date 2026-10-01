import { useEffect, useState } from "react";
import { useCurrentUser, useConversations, useMessages, sendMessage } from "../lib/store";
import { useRoute, navigate } from "../lib/router";
import { Link } from "../lib/Link";
import { EmptyState } from "../components/EmptyState";
import { Send, ChevronLeft, Chat as ChatIcon, Check } from "../components/Icons";
import { timeAgo, toFa } from "../lib/format";

export function MessagesPage() {
  const user = useCurrentUser();
  const route = useRoute();
  const conversations = useConversations(user?.id);
  const activeId = route.name === "messages" ? route.conversationId : undefined;
  const messages = useMessages(activeId || null);
  const [text, setText] = useState("");

  useEffect(() => { if (!user) navigate({ name: "login" }); }, [user]);
  if (!user) return null;

  const activeConv = conversations.find((c) => c.id === activeId);
  const otherName = activeConv ? (activeConv.buyerId === user.id ? activeConv.sellerName : activeConv.buyerName) : null;

  const send = async () => {
    if (!activeConv || !text.trim()) return;
    const msg = text.trim();
    setText("");
    try { await sendMessage(activeConv.id, user.id, msg); }
    catch { setText(msg); }
  };

  return (
    <div className="max-w-6xl mx-auto px-0 md:px-4 py-0 md:py-6">
      <div className="bg-white md:rounded-2xl md:border md:border-slate-200 overflow-hidden grid md:grid-cols-[300px_1fr] h-[calc(100vh-4rem-5rem)] md:h-[calc(100vh-8rem)] min-h-[500px]">
        {/* Conversation list */}
        <div className={`border-l border-slate-200 ${activeId ? "hidden md:flex" : "flex"} flex-col`}>
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">پیام‌ها</h2>
            <p className="text-xs text-slate-500 mt-1">{toFa(conversations.length)} مکالمه</p>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                <ChatIcon size={36} className="mx-auto text-slate-300 mb-2" />
                هنوز مکالمه‌ای ندارید
              </div>
            ) : (
              conversations.map((c) => {
                const other = c.buyerId === user.id ? c.sellerName : c.buyerName;
                return (
                  <Link
                    key={c.id}
                    to={{ name: "messages", conversationId: c.id }}
                    className={`flex items-center gap-3 p-3 border-b border-slate-50 hover:bg-slate-50 ${activeId === c.id ? "bg-blue-50" : ""}`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 grid place-items-center">
                      <span className="text-xl">📷</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">{other}</div>
                      <div className="text-xs text-slate-500 truncate">{c.listingTitle}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(c.lastMessageAt)}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className={`${activeId ? "flex" : "hidden md:flex"} flex-col`}>
          {!activeConv ? (
            <div className="flex-1 grid place-items-center text-slate-400 p-10">
              <div className="text-center">
                <ChatIcon size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">یک مکالمه را انتخاب کنید</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-3 border-b border-slate-100 flex items-center gap-3">
                <Link to={{ name: "messages" }} className="md:hidden p-2 -m-2 text-slate-600">
                  <ChevronLeft size={20} />
                </Link>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-bold">
                  {otherName?.charAt(0) ?? "؟"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-800 truncate">{otherName ?? "کاربر"}</div>
                  <div className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> آنلاین
                  </div>
                </div>
                {activeConv && (
                  <Link to={{ name: "listing", id: activeConv.listingId }} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-xs">
                    <div className="w-7 h-7 rounded overflow-hidden bg-white grid place-items-center">📷</div>
                    <span className="truncate max-w-32 font-medium">{activeConv.listingTitle}</span>
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 thin-scroll bg-slate-50 space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-10">شروع مکالمه...</div>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${mine ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"}`}>
                          <div className="leading-6 whitespace-pre-wrap">{m.text}</div>
                          <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${mine ? "text-blue-100" : "text-slate-400"}`}>
                            {timeAgo(m.createdAt)} {mine && <Check size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 h-11 px-4 bg-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
                <button onClick={send} disabled={!text.trim()} className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl grid place-items-center">
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {conversations.length === 0 && !activeId && (
        <div className="md:hidden p-4">
          <EmptyState icon="💬" title="پیام‌ای ندارید" description="مکالمات شما با خریداران و فروشندگان اینجا نمایش داده می‌شود." />
        </div>
      )}
    </div>
  );
}
