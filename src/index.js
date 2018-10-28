import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './css/index.css';
import './css/button.css';
import './css/colors.css';
import './css/scrollbar.css';
import store from './store';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <div>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </div>,
  document.getElementById('root'),
);
registerServiceWorker();
