import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ensure this CSS file exists
import Main from './main'; // Update to the new file name

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);
