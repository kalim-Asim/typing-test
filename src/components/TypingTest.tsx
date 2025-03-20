import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../WebSocketContext"; // Import the hook

const Text =
  "I knew that in spite of all the roses and kisses and restaurant dinners a man showered on a woman before he married her, what he secretly wanted when the wedding service ended was for her to flatten out underneath his feet like Mrs Willard's kitchen mat.";
// const socket = new WebSocket("ws://localhost:5000");

const TypingTest: React.FC = () => {
  const words = Text.split(" ");
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [typedWords, setTypedWords] = useState<string[]>(new Array(words.length).fill(""));
  const [accuracy, setAccuracy] = useState<number>(100);
  const [wpm, setWpm] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useWebSocket();
  const [messages, setMessages] = useState<string[]>([]);
/*
{"type":"userJoined","message":"dk created and joined the room","users":["dk"]}

{"type":"userJoined",
"message":"dk2 joined the room",
"users":["dk","dk2"]}
*/
  useEffect(() => {
    if (!socket) return;
    
    socket.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        if (parsedMessage.message) {
          setMessages((prev) => [...prev, parsedMessage.message]); 
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", event.data);
      }
    };

    return () => {
      if (socket) socket.onmessage = null;
    };
  }, [socket]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleStartRace = () => {
    const message = {
      type: "race",
      payload: { message: `Someone started the race!` },
    };
    socket?.send(JSON.stringify(message));
  };

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (startTime === null) setStartTime(Date.now());
    setCurrentInput(val);
    calculateAccuracy(val);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === " ") {
      e.preventDefault();
      checkWord();
    }
    if (e.key === "Enter" && currentWordIndex === words.length - 1) {
      finishTest();
    }
  }

  function checkWord() {
    const updatedWords = [...typedWords];
    updatedWords[currentWordIndex] = currentInput.trim();
    setTypedWords(updatedWords);
    setCurrentInput("");

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      calculateAccuracy("");
    } else {
      finishTest();
    }
  }

  function calculateAccuracy(val: string) {
    const updatedWords = [...typedWords];
    updatedWords[currentWordIndex] = val.trim();

    let totalTyped = updatedWords.join("").length;
    let totalCorrect = updatedWords
      .map((word, index) =>
        word === words[index] ? word.length : 0
      )
      .reduce((acc, val) => acc + val, 0);

    setAccuracy(totalTyped === 0 ? 100 : Math.round((totalCorrect / totalTyped) * 100));

    if (startTime) {
      let elapsedTime = (Date.now() - startTime) / 60000;
      if (elapsedTime > 0) {
        const calculatedWpm = Math.round((currentWordIndex + 1) / elapsedTime);
        setWpm(calculatedWpm);
      }
    }
  }

  function finishTest() {
    const updatedWords = [...typedWords];
    updatedWords[currentWordIndex] = currentInput.trim();
    setTypedWords(updatedWords);

    if (startTime) {
      let elapsedTime = (Date.now() - startTime) / 60000;
      if (elapsedTime < 0.2) elapsedTime = 0.2;
      const calculatedWpm = Math.round(words.length / elapsedTime);
      setWpm(calculatedWpm);

      setTimeout(() => {
        alert(`Typing Speed: ${calculatedWpm} WPM\nAccuracy: ${accuracy}%`);
        window.location.reload();
      }, 100);
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-400">Typing Test</h2>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl">
        <p className="text-lg text-gray-300 leading-relaxed">
          {words.map((word, index) => (
            <span
              key={index}
              className={`px-1 ${
                index === currentWordIndex
                  ? "bg-yellow-400 text-gray-900 font-bold rounded-md"
                  : typedWords[index] === words[index]
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {word}{" "}
            </span>
          ))}
        </p>

        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="mt-4 w-full p-3 text-lg border border-gray-600 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Start typing..."
        />

        <div className="flex justify-between items-center mt-4 text-lg">
          <p className="text-green-400">Accuracy: {accuracy}%</p>
          <p className="text-blue-400">WPM: {wpm !== null ? wpm : "--"}</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 transition rounded-lg font-bold text-white"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>

          <button
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 transition rounded-lg font-bold text-white"
            onClick={handleStartRace}
          >
            Start Race
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg h-40 overflow-auto w-full max-w-2xl">
        <h3 className="font-semibold text-blue-400 mb-2">Live Messages</h3>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p key={index} className="text-sm text-gray-300">
              {msg}
            </p>
          ))
        ) : (
          <p className="text-sm text-gray-500">No messages yet</p>
        )}
      </div>
    </div>
  );
};

export default TypingTest;
