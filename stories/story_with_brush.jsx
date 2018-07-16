import React from 'react';
import Timeline from '../src/Timeline';
import {mockData, mockLines, mockRange} from "../src/__tests__/Timeline.tester";

export default class StoryWithBrush extends React.Component {

    constructor(props){
        super(props);

        const data = mockData({size: 30});
        const domain = props.defaultRange ? mockRange(data) : null;
        this.state = {
            data: data,
            // lines: mockLines({size: 30}),
            domain: domain
        }
    }

    handleBrush = domain => {
        this.setState({domain})
    };

    render() {

        return (
            <div>
                <Timeline data={this.state.data}
                          lines={this.state.lines}
                          width={500} height={250}
                          range={this.state.domain}
                          onMouseover={val => console.log(val)}/>

                <Timeline data={this.state.data}
                          lines={this.state.lines}
                          width={500} height={80}
                          label={false} tooltips={false}
                          brush={true} onBrush={this.handleBrush} brushRange={this.state.domain}/>
            </div>
        );
    }
}
