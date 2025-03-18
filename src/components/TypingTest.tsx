import { useEffect, useRef, useState } from "react";

const Text = "The quick brown fox jumps over the lazy dog.";

const TypingTest: React.FC = () => {
  const words = Text.split(" ");
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [typedWords, setTypedWords] = useState<string[]>(new Array(words.length).fill(""));
  const [accuracy, setAccuracy] = useState<number>(100);
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    }
    else {
      finishTest()
    }
  }

  function calculateAccuracy(val: string) {
    const updatedWords = [...typedWords];
    updatedWords[currentWordIndex] = val.trim();

    let totalTyped = updatedWords.join("").length;
    let totalCorrect = updatedWords
      .map((word, index) =>
        index === words.length - 1 
          ? (word === words[index] ? word.length : 0)
          : word.split("").filter((char, i) => char === words[index][i]).length
      )
      .reduce((acc, val) => acc + val, 0);

    setAccuracy(totalTyped === 0 ? 100 : Math.round((totalCorrect / totalTyped) * 100));
  }

  function finishTest() {
    const updatedWords = [...typedWords];
    updatedWords[currentWordIndex] = currentInput.trim(); 
    setTypedWords(updatedWords);

    calculateAccuracy(currentInput.trim()); 

    if (startTime) {
      const elapsedTime = (Date.now() - startTime) / 60000; 
      const wordsPerMinute = Math.round(words.length / elapsedTime);
      setTimeout(() => {
        alert(`Typing Speed: ${wordsPerMinute} WPM\nAccuracy: ${accuracy}%`);
        window.location.reload();
      }, 100); 
    }
  }


  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Typing Test</h2>
      <p className="text-lg">
        {words.map((word, index) => (
          <span
            key={index}
            className={
              index === currentWordIndex
                ? "text-blue-500 font-bold"
                : typedWords[index] === words[index]
                ? "text-green-500"
                : "text-red-500"
            }
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
        className="border p-2 rounded"
      />
      <p className="text-lg">Accuracy: {accuracy}%</p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.location.reload()}>
        Reset
      </button>
    </div>
  );
};

export default TypingTest;
