import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../WebSocketContext";


const WaitRoom = () => {
  const socket = useWebSocket();
  const [join, setJoin] = useState<boolean>(true);
  const [roomId, setRoomId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate(); 
  
  

  const joinLobby = async () => {
    if (!roomId || !username) {
      alert("Please enter a Username and Room ID");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, username }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.message);
        socket?.send(JSON.stringify({ type: "join", payload: { roomId, username } }));
        navigate("/typing-test");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("An error occurred while joining the room.");
    }
  };
  
  const createLobby = async () => {
    if (!roomId || !username) {
      alert("Please enter a Username and Room ID");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, username }),
      });
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        alert(data.message);
        socket?.send(JSON.stringify({ type: "create", payload: { roomId, username } }));
        navigate("/typing-test");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("An error occurred while creating the room.");
    }
  };
  

  

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="bg-gray-700 p-6 rounded-2xl shadow-xl w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Racing Arena</h1>

        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              join ? "bg-blue-500 text-white" : "bg-gray-600"
            }`}
            onClick={() => setJoin(true)}
          >
            Join Room
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              !join ? "bg-blue-500 text-white" : "bg-gray-600"
            }`}
            onClick={() => setJoin(false)}
          >
            Create Room
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">{join ? "Join Room" : "Create Room"}</h3>

          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 rounded-md bg-gray-600 text-white mb-2 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter Room ID"
            className="w-full p-2 rounded-md bg-gray-600 text-white mb-2 outline-none"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>

        <button
          onClick={() => (join ? joinLobby() : createLobby())}
          className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-bold cursor-pointer"
        >
          {join ? "Jump In" : "Create Lobby"}
        </button>


        
      </div>
    </div>
  );
};

export default WaitRoom;
