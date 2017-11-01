import React, { Component } from 'react';


class App extends Component {
  state = {
    value: "",    
  }

  onChange = (input) => {
    this.setState({value: input.target.value})
    // console.log(this.state.value)
  }

  renderContent = (plantText, mentions) => {
    // mentions = [{data, offset, length}]
    
    var blocks = [];
    mentions.map((o, idx) => {
      var startLeft = idx === 0 ? 0 : mentions[idx-1].offset + mentions[idx-1].length;
      var endLeft = o.offset;
      var blockLeft = {text: plantText.slice(startLeft, endLeft)}
      blocks.push(blockLeft);
      var blockRight = {text: plantText.slice(o.offset, o.offset+ o.length), type: 'mention', data: o.data}
      blocks.push(blockRight)
    })
    var lastMention = mentions[mentions.length - 1];
    blocks.push({text: plantText.slice(lastMention.offset+lastMention.length, plantText.length)})
    return blocks
  }

  a=RegExp(`(?:^|\\s)(\@([^\@*))$`)

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

            <pre className="overley">
              {/* dangerouslySetInnerHTML={
                {__html: this.state.value.replace(/\n/g, "<br/>")
                  .replace(/\@(.+?)\s/g, (m, tk) => `<a href="#" class="mention">@${tk}</a> `)
                }}     */}
              {this.renderContent(this.state.value, [{offset: 4, length: 4}]).map((block, idx) => block.text !== "" && (
                block.type !== "mention" ? <span key={idx}>{block.text}</span> :
                 <a key={idx} href="#" className="mention">{block.text}</a>
              ))}
            </pre>
            
            
          </div>
        </div>
      </div>
    );
  }
}

export default App;
