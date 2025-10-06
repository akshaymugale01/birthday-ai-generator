import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
// import Otp from './pages/Otp';
import Details from './pages/Details';
import Lyrics from './pages/Lyrics';
import Users from './pages/Users';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/otp" element={<Otp />} /> */}
          <Route path="/details" element={<Details />} />
          <Route path="/lyrics" element={<Lyrics />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
