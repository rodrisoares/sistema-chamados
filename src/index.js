import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// Aplica o tema salvo antes da renderização para evitar "flash" de cor
const savedTheme = localStorage.getItem('theme');
if(savedTheme){
  document.documentElement.setAttribute('data-theme', savedTheme);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
