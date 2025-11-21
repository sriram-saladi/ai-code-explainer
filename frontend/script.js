// frontend/script.js
const BASE_WS = "http://127.0.0.1:8000"; // same origin as backend
const socket = io(BASE_WS, { transports: ["websocket"] });

// Example elements you should have in index.html (add if missing)
// <input id="roomInput" placeholder="room id (e.g., project1)" />
// <input id="authorInput" placeholder="your name" />
// <button id="joinBtn">Join</button>
// <div id="comments"></div>
// <input id="commentText" placeholder="Write a comment..." />
// <button id="sendComment">Send</button>

document.getElementById("joinBtn").addEventListener("click", () => {
  const room = document.getElementById("roomInput").value;
  const author = document.getElementById("authorInput").value || "guest";
  socket.emit("join", { room, author });
  document.getElementById("comments").innerHTML = "Loading room comments...";
});

// receive initial room history (emitted to this SID)
socket.on("room_history", (docs) => {
  renderComments(docs);
});

// receive new comment broadcasts
socket.on("new_comment", (doc) => {
  appendComment(doc);
});

// optional LLM progress channel
socket.on("llm_progress", (obj) => {
  console.log("LLM progress:", obj);
});

// send a comment
document.getElementById("sendComment").addEventListener("click", () => {
  const room = document.getElementById("roomInput").value;
  const author = document.getElementById("authorInput").value || "guest";
  const text = document.getElementById("commentText").value;
  const line = parseInt(document.getElementById("lineInput").value) || null;
  const parent_id = null; // implement threaded replies later

  const payload = { room, author, text, line, parent_id };
  socket.emit("comment", payload);
  document.getElementById("commentText").value = "";
});

// helper functions to render comments
function renderComments(docs) {
  const container = document.getElementById("comments");
  container.innerHTML = "";
  docs.forEach(doc => appendComment(doc));
}

function appendComment(doc) {
  const container = document.getElementById("comments");
  const el = document.createElement("div");
  el.className = "comment";
  el.innerHTML = `
    <div class="meta"><strong>${escapeHTML(doc.author)}</strong>
      ${doc.line ? `<span class="line">line ${doc.line}</span>` : ""}
      <span class="time">${new Date(doc.timestamp).toLocaleString()}</span>
    </div>
    <div class="text">${escapeHTML(doc.text)}</div>
  `;
  container.appendChild(el);
}

// simple sanitizer
function escapeHTML(s) {
  if (!s) return "";
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
