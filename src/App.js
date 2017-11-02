import React, { Component } from 'react';

const KEY_ENTER = 13;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

const KEY_MENTION_SHIFT = 50; //@

class App extends Component {
  state = {
    value: "",
    mentions: [],
    suggestPosition: {
      left: 0,
      top: 0
    },
    suggestSeletedIndex: 0,
    suggests: suggestMock,
    typingIndex: -1
  }

  onChange = (input) => {
    this.setState({ value: input.target.value })
    // console.log(this.state.value)
  }

  renderContent = (plantText, mentions) => {
    // mentions = [{data, offset, length, typing}]

    var blocks = [];
    mentions.map((o, idx) => {
      var startLeft = idx === 0 ? 0 : mentions[idx - 1].offset + mentions[idx - 1].length;
      var endLeft = o.offset;
      var blockLeft = { text: plantText.slice(startLeft, endLeft) }
      blocks.push(blockLeft);
      var blockRight = { text: plantText.slice(o.offset, o.offset + o.length), type: o.typing ? 'typing' : 'mention', data: o.data }
      blocks.push(blockRight)
    })
    if (mentions.length !== 0) {
      var lastMention = mentions[mentions.length - 1];
      blocks.push({ text: plantText.slice(lastMention.offset + lastMention.length, plantText.length) })
    } else {
      blocks.push({ text: plantText })
    }
    // console.log(blocks)
    return blocks;
  }

  componentDidMount() {
    this.refs.textarea.addEventListener('keydown', e => this._handleKeyDown(e))
  }

  _handleKeyDown = event => {
    var selectionStart = event.target.selectionStart;
    var selectionEnd = event.target.selectionEnd;
    if (selectionEnd === selectionStart) {
      switch(event.keyCode) {
        case KEY_BACKSPACE: this.__handleBackspace(selectionStart, selectionEnd); break;
        case KEY_UP: this.__handlePressUp(event); break;
        case KEY_DOWN: this.__handlePressDown(event); break;
        case KEY_ENTER: this.__handlePressEnter(event, selectionStart); break;
      }

      if (event.shiftKey && event.keyCode === 50 && this.state.typingIndex !== -1) {
        this.removeMention(this.state.typingIndex)        
      }

      // if (event.ctrlKey) {
      //   this.applyMention('@Dao Hong Phong', selectionStart);
      // }
    }
    if (this.state.typingIndex !== -1 && (event.keyCode === 32)) { 
      console.log('clear typing mention')
      this.removeMention(this.state.typingIndex)
    }
  }

  __handleBackspace = (selectionStart, selectionEnd) => {
    var isRemoveMentionIndex = -1;
    this.state.mentions.map((m, idx) => {
      if (m.offset < selectionStart && selectionStart <= (m.offset + m.length)) {
        isRemoveMentionIndex = idx;
        // console.log('remove mention: ', m, { isRemoveMentionIndex })
        // this.removeMention(isRemoveMentionIndex);              
      }
    });
    if (isRemoveMentionIndex > -1) {
      // this.removeMention(isRemoveMention)
      var mention = this.state.mentions[isRemoveMentionIndex];
      console.log({mention},  this.state.mentions);
      if (mention.length - 1 !== 0 && mention.typing) {
        this.updateMentionTyping({ data: null, offset: mention.offset, length: mention.length - 1 });
      } else {
        this.removeMention(isRemoveMentionIndex);
        this.removeMentionText(mention.offset, mention.length - 1);
        setTimeout(() => {
          this.refs.textarea.selectionStart = mention.offset;
          this.refs.textarea.selectionEnd = mention.offset;
        }, 200)
      }
    }
  }

  __handlePressUp = (event) => {
    if (this.state.typingIndex === -1) return;
    event.preventDefault();

    const length = this.state.suggests.length;
    var suggestSeletedIndex = (this.state.suggestSeletedIndex - 1 + length) % length;
    this.setState({suggestSeletedIndex})
    
  }

  __handlePressDown = (event) => {
    if (this.state.typingIndex === -1) return;
    event.preventDefault();

    const length = this.state.suggests.length;
    var suggestSeletedIndex = (this.state.suggestSeletedIndex + 1) % length;

    this.setState({suggestSeletedIndex})
  }

  __handlePressEnter = (event, selectionStart) => {
    if (this.state.typingIndex === -1) return;
    event.preventDefault();
    this.applyMention(this.state.suggests[this.state.suggestSeletedIndex].fullname, selectionStart);
    
  }

  onInput = (event) => {
    var selectionStart = event.target.selectionStart;
    // console.log({selectionStart}, event.target.value)
    var selectionEnd = event.target.selectionEnd;
    var value = this.refs.textarea.value;
    if (selectionEnd === selectionStart) {
      if (value[selectionStart - 1] === '@' && (value[selectionStart - 2] === ' ' || value[selectionStart - 2] === '\n' || selectionStart === 1)) {
        this.pushMention({ data: null, offset: selectionStart - 1, length: 1, typing: true }, () => {
          this.setState({ typingIndex: this.state.mentions.length - 1 })
        });
      }
      if (this.state.typingIndex !== -1) {
        var mentionTyping = this.state.mentions[this.state.typingIndex];
        if (selectionStart > mentionTyping.offset && selectionStart <= (mentionTyping.offset + mentionTyping.length + 1)) {
          this.updateMentionTyping({ data: null, offset: mentionTyping.offset, length: mentionTyping.length + 1 })
        }
        if (selectionStart > (mentionTyping.offset + mentionTyping.length + 1)) {
          this.removeMention(this.state.typingIndex);
        }
      } else {
        console.log('update mention offset')
        if (this.state.mentions.length !== 0) this.updateMentionsOffset(selectionStart);
      }
    } else {

    }
  }
  // a=RegExp(`(?:^|\\s)(\@([^\@*))$`)
  pushMention = ({ data, offset, length, typing }, done) => {
    this.setState({ mentions: this.state.mentions.concat({ data, offset, length, typing }) }, done)
  }

  updateMentionTyping = ({ data, offset, length }) => {
    var mentions = [...this.state.mentions];
    mentions[this.state.typingIndex] = { ...mentions[this.state.typingIndex], data, offset, length }
    this.setState({ mentions });
  }

  removeMention = (index) => {
    var mentions = [...this.state.mentions];
    mentions.splice(index, 1);
    this.setState({ mentions, typingIndex: -1, suggestSeletedIndex: 0 });
  }

  removeMentionRange = (selectionStart, selectionEnd) => {
    
  }

  removeMentionText = (offset, length) => {
    var text = this.state.value;
    var value = text.substring(0, offset) +  text.substring(offset + length);
    this.setState({value})
  }

  updateMentionsOffset = (offset) => {
    var mentions = this.state.mentions;
    var isApply = false;
    var newMentions = mentions.map((mention, idx) => {
      if (offset-1 <= mention.offset) {
        isApply = true;
        return {...mention, offset: mention.offset + 1};
      } else {
        return mention
      }
    });
    if (isApply) {
      console.log({newMentions})
      this.setState({mentions: newMentions});
    }
  }

  applyMention = (text, selectionStart) => {
    var mentions = [...this.state.mentions];
    this.replaceText('@'+text, selectionStart);
    mentions[this.state.typingIndex] = 
      { ...mentions[this.state.typingIndex], length: text.length + 1, typing: false }
    this.setState({ mentions, typingIndex: -1, suggestSeletedIndex: 0 });
  }

  // replace a word with char index (current caret position)
  replaceText = (what, index) => {
    var text = this.state.value;
    var getStart = (txt, idx) => {
      if (txt[idx] === ' ' || idx === -1 || txt[idx] === '\n') return idx + 1;
      return(getStart(txt, idx-1));
    }
    var getEnd = (txt, idx) => {
      if (txt[idx] === ' ' || (idx === txt.length)) return idx;
      return(getEnd(txt, idx + 1));
    }
    this.setState({value:
      text.substring(0, getStart(text, index)) + what + text.substring(getEnd(text, index-1))});
  }

  onMouseUp = () => {
    // var selObj = window.getSelection();     
    // var selRange = selObj.getRangeAt(0);
    // console.log(selRange)
    // console.log(selObj.toString())
    // console.log(this.refs.textarea.selectionStart)
    // console.log(this.refs.textarea.selectionEnd)
  }

  render() {
    const { suggestPosition, suggestSeletedIndex, typingIndex } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1> </h1>
          
        </header>
        <div className="App-intro">
          <div className="fozg-mentions">
            <div className="metionsWrap">
              <textarea spellCheck={false} value={this.state.value} onChange={text => this.onChange(text)} ref="textarea" rows={10}
                onMouseUp={this.onMouseUp}
                onInput={this.onInput}
              >
              </textarea>

              <pre className="overley" style={{zIndex: typingIndex === -1 ? 1: 3}}>
                {/* dangerouslySetInnerHTML={
                  {__html: this.state.value.replace(/\n/g, "<br/>")
                    .replace(/\@(.+?)\s/g, (m, tk) => `<a href="#" class="mention">@${tk}</a> `)
                  }}     */}
                {this.renderContent(this.state.value, this.state.mentions).map((block, idx) => block.text !== "" && (
                  block.type !== 'typing' ? (block.type !== "mention" ? <span key={idx}>{block.text}</span> :
                    <a key={idx} href="#" className="mention">{block.text}</a>)
                    : <span key={idx} style={{ position: 'relative' }} className="typing">{block.text}
                      <RenderSuggest top={20} left={0} suggestSeletedIndex={suggestSeletedIndex} />
                    </span>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

const RenderSuggest = ({ top, left, suggestSeletedIndex }) => (
  <div style={{ top, left, }}
    className="suggestsWrap"
  >
    {suggestMock.map((o, idx) => (
      <div key={o.username} className={"item " + (suggestSeletedIndex === idx && 'active')}>
        <div>{o.fullname}</div>
        <i style={{ fontSize: 10 }}>{o.username}</i>
      </div>
    ))}
  </div>
)

const suggestMock = [
  {
    username: '@fozgee',
    fullname: 'Dao Hong Phong'
  },
  {
    username: '@helen',
    fullname: 'Hoang Thi Binh'
  },
  {
    username: '@Billkien',
    fullname: 'Tran Trung Kien'
  },
  {
    username: '@Mokudo',
    fullname: 'Nguyen Huy Thuy'
  },
]

function getCaretPos(input) {
  // Internet Explorer Caret Position (TextArea)
  if (document.selection && document.selection.createRange) {
    var range = document.selection.createRange();
    var bookmark = range.getBookmark();
    var caret_pos = bookmark.charCodeAt(2) - 2;
  } else {
    // Firefox Caret Position (TextArea)
    if (input.setSelectionRange)
      var caret_pos = input.selectionStart;
  }
  return caret_pos;
}
