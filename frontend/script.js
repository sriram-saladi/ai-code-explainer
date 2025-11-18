const btn = document.getElementById("submitBtn");
const output = document.getElementById("output");

btn.addEventListener("click", async () => {
  const code = document.getElementById("codeInput").value;
  const action = document.getElementById("action").value;

  output.textContent = " Processing...";

  try {
    const res = await fetch("http://127.0.0.1:8000/process-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action }),
    });

    const data = await res.json();
    if (data.result) {
      output.textContent = data.result;
    } else {
      output.textContent = "⚠️ Error: " + JSON.stringify(data);
    }
  } catch (err) {
    output.textContent = "❌ Failed to connect to backend.\n" + err;
  }
});
