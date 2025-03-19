import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WaitRoom from "./components/WaitRoom";
import TypingTest from "./components/TypingTest";  // Import your TypingTest component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WaitRoom />} />
        <Route path="/typing-test" element={<TypingTest />} />
      </Routes>
    </Router>
  );
}

export default App;
