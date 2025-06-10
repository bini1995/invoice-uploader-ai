import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const apiBase = process.env.REACT_APP_API_BASE_URL;
fetch(`${apiBase}/api/invoices`);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
