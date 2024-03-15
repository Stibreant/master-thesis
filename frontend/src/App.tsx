import React from 'react';
// import logo from './logo.svg';
import './App.css';

// import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapPage from './pages/MapPage';
import Layout from './pages/Layout';
import ChatComponent from './components/ChatComponent';


function App() {
  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<MapPage />} />
          <Route path="chat" element={<ChatComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
