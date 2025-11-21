const handleJoin = async () => {
    const response = await fetch("/api/room/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (data.success) {
        navigate(`/room/${code}`); // go to comment/chat page
    } else {
        alert("Invalid room code");
    }
};
useEffect(() => {
  if (!roomCode) return;
  socket.emit("join", { room: roomCode });
}, [roomCode]);

