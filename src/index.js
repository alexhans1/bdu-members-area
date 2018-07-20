import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import './css/button.css';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <div>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </div>,
  // eslint-disable-next-line no-undef
  document.getElementById('root'),
);
registerServiceWorker();
