import React from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app';

/* --- React 18 版後淘汰這個方法 --- */
// ReactDOM.render(
//     <App/>, 
//     document.getElementById('root')
// )

const documentGetRoot = document.getElementById('root');
const root = ReactDOM.createRoot(documentGetRoot);

root.render(<App />)