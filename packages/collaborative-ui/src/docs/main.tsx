import React from 'react';
import * as ReactDOM from 'react-dom/client';
import {App} from './App';

import 'nano-theme/lib/global-reset';

const div = document.createElement('div');
document.body.appendChild(div);

ReactDOM.createRoot(div).render(<App />);
