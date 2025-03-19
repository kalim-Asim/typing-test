import { useState } from "react";

const WaitRoom = () => {
  const [Join, setJoin] = useState<boolean>(true);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="bg-gray-700 p-6 rounded-2xl shadow-xl w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Racing Arena</h1>
        
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              Join ? "bg-blue-500 text-white" : "bg-gray-600"
            }`}
            onClick={() => setJoin(true)}
          >
            Join Room
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              !Join ? "bg-blue-500 text-white" : "bg-gray-600"
            }`}
            onClick={() => setJoin(false)}
          >
            Create Room
          </button>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">{Join ? "Join Room" : "Create Room"}</h3>
          
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 rounded-md bg-gray-600 text-white mb-2 outline-none"
          />

          <input
            type="text"
            placeholder="Enter Room ID"
            className="w-full p-2 rounded-md bg-gray-600 text-white mb-2 outline-none"
          />
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-2 rounded-md bg-gray-600 text-white outline-none"
          />
        </div>

        <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-bold cursor-pointer">
          {Join ? "Jump In" : "Create Lobby"}
        </button>
      </div>
    </div>
  );
};

export default WaitRoom;
