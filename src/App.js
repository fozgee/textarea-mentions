import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    value: ""
  }

  onChange = (input) => {
    this.setState({value: input.target.value})
    // console.log(this.state.value)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          <div className="metionsWrap">
            
            <textarea spellCheck={false} value={this.state.value} onChange={text => this.onChange(text)} ref="textarea" rows={10}> 
            </textarea>

            <pre className="overley" dangerouslySetInnerHTML={
                {__html: this.state.value.replace(/\n/g, "<br/>").replace(/phong/g, '<a href="#" class="mention">phong</a>')}
              } />
            
            
          </div>
        </div>
      </div>
    );
  }
}

export default App;
