const BASE = "http://127.0.0.1:8000";

// Validate room code
export async function validateRoom(room) {
    const res = await fetch(`${BASE}/validate-room/${room}`);
    return res.json();
}

// Process code
export async function processCode(code, action) {
    const res = await fetch(`${BASE}/process-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action })
    });
    return res.json();
}
