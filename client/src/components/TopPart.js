import React, { Component } from 'react';

export class TopPart extends Component {
	render(){
		return(
			<div className="container-fluid">
        <div className="jumbotron">
          <h1 className="display-4">Hello, I am Tinkerbot</h1>
          <p className="lead">I am a chatbot that will help you search and filter events on Eventbrite.</p>
          <hr className="my-4"/>
          <p>Shall we?</p>
        </div>
			</div>
		);
	}
}
