"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send } from "lucide-react";
import { chatApi } from "../src/lib/api.js";

const inr = (n) => Number(n).toLocaleString("en-IN");

const GREETING = {
  from: "bot",
  text: "Hi! I'm the StayPoint assistant. Ask me about PGs, or tell me your budget — e.g. \"Suggest a highly rated PG under 6000 for girls with wifi near Jamia\".",
  pgs: [],
};

const SUGGESTIONS = [
  "What is a PG?",
  "Suggest a PG under 6000 for girls with wifi",
  "What documents do I need?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text: message, pgs: [] }]);
    setLoading(true);
    try {
      const res = await chatApi.send(message);
      setMessages((m) => [...m, { from: "bot", text: res.reply, pgs: res.pgs || [] }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Sorry, I couldn't reach the board right now. Try again in a moment.", pgs: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="btn btn-green fixed bottom-5 right-5 z-50 !w-14 !h-14 !p-0 !rounded-full flex items-center justify-center shadow-lg"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-flyer border-2 border-ink shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-ink text-flyer px-4 py-3 flex items-center gap-2">
            <MessageCircle size={16} aria-hidden="true" />
            <span className="mono-label !text-flyer">StayPoint Assistant</span>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-wall">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block px-3 py-2 text-sm max-w-[85%] border-2 border-ink ${
                    m.from === "user" ? "bg-green text-ink" : "bg-flyer text-ink"
                  }`}
                >
                  {m.text}
                </div>
                {m.pgs && m.pgs.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.pgs.map((pg) => (
                      <Link
                        key={pg.id}
                        to={`/pg/${pg.id}`}
                        onClick={() => setOpen(false)}
                        className="block text-left bg-flyer border-2 border-ink px-3 py-2 no-underline hover:bg-tape/40 transition-colors"
                      >
                        <p className="disp text-base text-ink leading-tight">{pg.name}</p>
                        <p className="mono-data text-xs text-green-deep">
                          ₹{inr(pg.rentSingle)}/mo
                          {pg.avgRating != null && ` · ★ ${pg.avgRating.toFixed(1)}`}
                          {pg.verified && " · ✓ Verified"}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="mono-label text-faded">…thinking</p>}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2 flex flex-wrap gap-2 bg-wall border-t-2 border-ink/15">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="mono-label border-2 border-ink bg-flyer px-2 py-1 hover:bg-tape/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3 border-t-2 border-ink flex gap-2 bg-flyer"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="field !py-2 text-sm"
              aria-label="Chat message"
            />
            <button type="submit" disabled={loading} className="btn btn-ink !px-3 !py-2">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
