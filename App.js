import {Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
// import Home from "./components/Home";

import './App.css';
import Dashboard from "./components/dashboard/Dashboard";



function App() {
  return (
    <div className="App">
    {/* <Navbar></Navbar> */}
    <Routes>
          <Route exact path="/" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/home" element={<Dashboard/>} />
    </Routes>
    </div>
  );
}

export default App;
