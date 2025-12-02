// src/ModelMint3DGenerator.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ModelMint3DGenerator
 * - Beautified chat UI (ChatGPT-like)
 * - Shows timestamps, avatars, and a typing indicator
 * - Supports server response containing: { text, image, stlUrl }
 * - If server returns `stlUrl`, UI shows "Preview" button (opens model-viewer modal)
 * - Includes "Download STL" button when stlUrl present
 *
 * Server contract (unchanged):
 * POST /chat  body: { message: string }
 * response JSON: { text: string, image?: string, stlUrl?: string }
 */

export default function ModelMint3DGenerator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]); // { role: 'user'|'bot', text, image?, stlUrl?, ts }
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // for modal preview
  const [showPreview, setShowPreview] = useState(false);
  const historyRef = useRef(null);

  // Ensure model-viewer is available when the preview modal opens.
  useEffect(() => {
    if (!showPreview) return;
    if (window.customElements && window.customElements.get("model-viewer")) return;

    // dynamically load model-viewer from unpkg (only when needed)
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      // leave script in place for subsequent opens (fast). No cleanup required.
    };
  }, [showPreview]);

  useEffect(() => {
    // Auto-scroll to bottom whenever messages change
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  function formatTime(ts = Date.now()) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  async function sendMessage() {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", text: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setLoading(true);
    setTyping(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} - ${text}`);
      }

      // expect JSON { text, image?, stlUrl? }
      const data = await res.json();

      const botMsg = {
        role: "bot",
        text: data.text || "",
        image: data.image,
        stlUrl: data.stlUrl,
        ts: Date.now(),
      };

      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "bot", text: `Error: ${err.message}`, ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
      // small delay to let UX show typing -> done
      setTimeout(() => setTyping(false), 250);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function openPreview(url) {
    setPreviewUrl(url);
    setShowPreview(true);
  }

  function downloadFile(url, filename = "model.stl") {
    // Create an anchor and force download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Small helper to render an avatar
  function Avatar({ role }) {
    if (role === "user") {
      return (
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
          Y
        </div>
      );
    }
    // bot/system avatar
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-sm font-semibold">
        M
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">ModelMint 3D Generator</h1>
          <p className="text-sm text-gray-500">Turn prompts into 3D-printable models (STL) — Chat to design.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Home button */}
          <button
            onClick={() => navigate("/")}
            className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-gray-50"
            title="Back to home"
          >
            Home
          </button>

          <div className="text-xs text-gray-500">Status</div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              loading ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
            }`}
          >
            {loading ? "Generating…" : "Idle"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat column */}
        <div className="md:col-span-2">
          <div className="h-[520px] border border-gray-200 rounded-lg bg-white flex flex-col overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                  MM
                </div>
                <div>
                  <div className="font-medium">ModelMint AI</div>
                  <div className="text-xs text-gray-500">3D model assistant</div>
                </div>
              </div>

              <div className="text-xs text-gray-400">Tips: be specific — size, holes, engravings, and orientation.</div>
            </div>

            <div
              ref={historyRef}
              id="chat-history"
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
            >
              {messages.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-20">
                  Say something like: <span className="text-gray-700 italic">"A hexagonal keychain with 'PR' engraved"</span>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {/* avatar */}
                  <div className={`${msg.role === "bot" ? "" : "ml-auto order-2"}`}>
                    <Avatar role={msg.role} />
                  </div>

                  <div className={`flex-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-3 rounded-xl shadow ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                      style={{ maxWidth: "85%" }}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Image if any */}
                      {msg.image && (
                        <div className="mt-3">
                          <img src={msg.image} alt="generated" className="max-w-xs rounded border" />
                        </div>
                      )}

                      {/* STL actions */}
                      {msg.stlUrl && (
                        <div className="mt-3 flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openPreview(msg.stlUrl)}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:brightness-95"
                          >
                            Preview 3D
                          </button>

                          <button
                            onClick={() => downloadFile(msg.stlUrl)}
                            className="px-3 py-1 text-sm border rounded bg-white text-gray-700"
                          >
                            Download STL
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-400 mt-1">
                      {msg.role === "user" ? "You" : "ModelMint AI"} • {formatTime(msg.ts)}
                    </div>
                  </div>
                </div>
              ))}

              {/* typing indicator */}
              {typing && (
                <div className="flex items-start gap-3">
                  <div>
                    <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-sm font-semibold">
                      M
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white text-gray-700 w-28">
                    <div className="flex gap-1 items-center">
                      <span className="dot animate-pulse inline-block w-2 h-2 rounded-full bg-gray-600" />
                      <span className="dot animate-pulse inline-block w-2 h-2 rounded-full bg-gray-600 delay-75" />
                      <span className="dot animate-pulse inline-block w-2 h-2 rounded-full bg-gray-600 delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                <textarea
                  id="prompt"
                  placeholder="Describe a 3D model (e.g. 'a coin with a star hole, 25mm dia, 2mm thick')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring"
                  rows={2}
                  disabled={loading}
                />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg shadow-sm font-medium focus:outline-none ${
                      loading ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-blue-600 text-white"
                    }`}
                  >
                    {loading ? "Generating..." : "Generate"}
                  </button>

                  <button
                    onClick={() => setMessages([])}
                    className="px-4 py-2 rounded-lg border text-sm text-gray-700 bg-white"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-400">Press Enter to send. Use Shift+Enter for a newline.</div>
            </div>
          </div>
        </div>

        {/* Right column (help / examples / history) */}
        <aside className="md:col-span-1">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium">Quick prompts</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <button
                  onClick={() => setPrompt("A round keychain, 30mm diameter, hole at top, text 'PR' engraved")}
                  className="text-left w-full"
                >
                  • Keychain with engraved initials
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setPrompt(
                      "A cylindrical spacer, outer dia 10mm, inner hole 4mm, height 8mm, chamfered edges"
                    )
                  }
                  className="text-left w-full"
                >
                  • Mechanical spacer (cylinder)
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setPrompt(
                      "A token with two holes and a star-shaped cutout in the center, 40mm x 25mm, 3mm thick"
                    )
                  }
                  className="text-left w-full"
                >
                  • Token with star cutout
                </button>
              </li>
            </ul>

            <div className="mt-4 text-xs text-gray-500">
              Output: AI will return model file URL (STL) you can preview or download. Server must return `stlUrl`.
            </div>
          </div>
        </aside>
      </div>

      {/* Preview modal */}
      {showPreview && previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-medium">3D Preview</div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1 border rounded"
                >
                  Open raw
                </a>

                <button
                  onClick={() => downloadFile(previewUrl)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Download STL
                </button>

                <button
                  onClick={() => setShowPreview(false)}
                  className="px-3 py-1 text-sm border rounded"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Use model-viewer if possible (supports .stl via some browsers / or convert on server to glb) */}
              {/* model-viewer prefers glTF/GLB; stl support varies. If previewUrl is STL, server-side conversion to glb is recommended. */}
              <div className="w-full h-[60vh] bg-gray-100 rounded flex items-center justify-center">
                {/* If model-viewer is available use it, otherwise show a download link */}
                {window.customElements && window.customElements.get("model-viewer") ? (
                  <model-viewer
                    src={previewUrl}
                    alt="3D model"
                    camera-controls
                    auto-rotate
                    ar
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="mb-3 text-sm text-gray-600">
                      3D preview component not loaded. You can still download the file.
                    </div>
                    <div>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 border rounded bg-white"
                      >
                        Open / Download STL
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
