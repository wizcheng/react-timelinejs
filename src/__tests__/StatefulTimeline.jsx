import React from "react";
import {mockData, mockLines, mockRange} from "./Timeline.tester";
import Timeline from "../Timeline";

export class StatefulTimeline extends React.Component {

    constructor(props){
        super(props);
        const data = mockData({size: 3});
        this.state = {
            data: data,
            lines: mockLines({}),
            range: mockRange(data)
        }
    }

    updateMockData = () => {
        const data = mockData({size: 4});
        this.setState({
            data: data,
            lines: mockLines({}),
            range: mockRange(data)
        });
    };

    render() {

        const {data, lines, range} = this.state;
        return (
            <div>
                <button id='update-mock-data' onClick={this.updateMockData}>generate</button>
                <Timeline id={'1'} data={data} dataKey='key' lines={lines} range={range}/>
            </div>
        )
    }


}
