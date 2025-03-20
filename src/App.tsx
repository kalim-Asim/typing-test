import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WaitRoom from "./components/WaitRoom";
import TypingTest from "./components/TypingTest"; 
import { WebSocketProvider } from "./WebSocketContext"; 
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <WebSocketProvider>  
          <Routes>
            <Route path="/" element={<WaitRoom />} />
            <Route path="/typing-test/:roomId" element={<TypingTest />} /> 
          </Routes>
        </WebSocketProvider>
      </Router>
    </>
  );
}

export default App;
