import React from 'react';
import { createRoot } from 'react-dom/client';
import Editor from './components/Editor/index';
import './style.css';

const App = () => (
  <>
    <div className="title">Todo Code Editor</div>
    <Editor language={null} />
  </>
);

const container = document.getElementById('container');
const root = createRoot(container);
root.render(<App />);
