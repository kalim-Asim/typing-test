import { useEffect, useRef, useState } from "react";

const Text = "The quixc jfdk i jkj fjdl  jfds. josfj . jojsf."

const TypingTest: React.FC = () => {
  const words = Text.split(" ");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>(new Array(words.length).fill(""));
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCurrentInput(val);
    calculateAccuracy(val);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === " ") {
      e.preventDefault();
      checkword();
    }
  }

  function checkword() {
    const updatedWords = [...typedWords]
    updatedWords[currentWordIndex] = currentInput.trim();

    setTypedWords(updatedWords);
    setCurrentInput("");

    if (currentWordIndex < words.length) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  }

  function calculateAccuracy(val: string) {
    const correctChars = words[currentWordIndex].slice(0, val.length);
    let correctCount = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === correctChars[i]) correctCount++;
    }
    const totalTyped = typedWords.join("").length + val.length;
    const totalCorrect = typedWords
      .map((word, index) => word.split("").filter((char, i) => char === words[index][i]).length)
      .reduce((acc, val) => acc + val, 0) + correctCount;
    
    setAccuracy(totalTyped === 0 ? 100 : Math.round((totalCorrect / totalTyped) * 100));
  }
  
  return (
    <div className="h-screen bg-black">
      <h2>Typing Test</h2>
      <p>
        {words.map((word, index) => (
          <span key={index}> 
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
        className=""
      />

      <p>Accuracy: {accuracy}%</p>
      <button onClick={() => window.location.reload()}>Reset</button>
    </div>
  )
}

export default TypingTest;