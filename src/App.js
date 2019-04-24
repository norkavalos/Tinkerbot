import React, { Component } from 'react';
import './App.css';
import { TopPart } from './components/TopPart';
import { Chat } from './components/Chat';

class App extends Component {
  render() {
    return (
      <div className="App">
        <TopPart />
        <Chat />
      </div>
    );
  }
}

export default App;
