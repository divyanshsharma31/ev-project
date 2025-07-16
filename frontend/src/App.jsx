import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './components/landingpage';
import LandingPage from './components/landingpage';
import HomePage from './components/homepage.jsx';
const App = () => {
  return (
    <Routes>
      <Route path = "/" element = {<LandingPage />} />
      <Route path = "/home" element = {<HomePage />} />
    </Routes>
  );
}

export default App;