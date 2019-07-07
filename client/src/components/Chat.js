import React,  { Component } from 'react';

export class Chat extends Component {

  constructor(props) {
   super(props);
   this.myRef=React.createRef(); // to help with scrolling
   this.state = {
     msg: '',
     conversations: [],
   };
   this.handleChange = this.handleChange.bind(this);
   this.handleSend = this.handleSend.bind(this);
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-8 offset-2">
            <div className="chat-container" style={{height: '400px'}} >
              <div className="area">
                <div className="L">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4-UpD-3UAUatWEG1oglZo5MwHysjRQY_aBbtnf6gVtBUEV42"
                    alt="bot avatar"
                  />
                </div>
                <div className="text R textR">Hello, I am Tinkerbot</div>
                <div className="text R textR">I can help you find events on Eventbrite. Can you tell me the location you would like to me to look for?</div>
              </div>

              <div>
                {
                  this.state.conversations.map((val, index) => {
                    return (
                      <div key={index}>
                        <div className="area">
                          <div className="R">
                            <img
                              src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSxU35znsBhAWQd5BouLIVtH1P4WNa0JZ_XXpyViHOIARbM2igbNgC6_kp5"
                              alt="woman avatar"
                            />
                          </div>

                          <div className="text L textL">{val.me}</div>
                        </div>

                        <div className="area">
                          <div className="L">
                            <img
                              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4-UpD-3UAUatWEG1oglZo5MwHysjRQY_aBbtnf6gVtBUEV42"
                              alt="man avatar"
                            />
                          </div>
                          <div className="text R textR">{val.bot}</div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
        <div id="end" ref={this.myRef}></div>
        <div className="row justify-content-center mt-4">
          <div className="col-8">
            <div className="area form-group form-check">
              <form onSubmit={this.handleSend}>
                <label>Enter message: (quit to end chat)</label>
                <input className="form-control" type="text" value={this.state.msg} onChange={this.handleChange}/>
              </form>
            </div>
          </div>
        </div>
      </div>

    );
  }

  handleChange(event) {
    this.setState({
      msg: event.target.value
    });
  }

  scrollToMyRef() {
    window.scrollTo(0, this.myRef.current.offsetTop)
  }

  handleSend(event) {
    event.preventDefault();
    event.persist(); // why: https://reactjs.org/docs/events.html#event-pooling

    const data = {
      message: this.state.msg,
    };

    const requestOpt = {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers:{
        'Content-Type': 'application/json'
      }
    };

    console.log(requestOpt, 'response')
    fetch(`/api/sendMessage`, requestOpt)
    .then(res => res.text())
    .then((response => {
        const newConv = {
          me: this.state.msg,
          bot: response,
        };
        this.setState({msg:''});
        this.scrollToMyRef();
        this.setState(state => {
          return {
            msg: state.msg,
            conversations: state.conversations.concat([newConv])
          };
        });


      }))
      .catch((err) => {
        console.log(err, '***errr');
      });
  }
}
