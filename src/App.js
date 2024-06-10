import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
// import Home from './pages/home';
import Code from './pages/code';


function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Code />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
