import React from 'react';
import Timeline from '../Timeline';
import {mockData, mockLines, mockRange} from './Timeline.tester';

class StatefulTimeline extends React.Component {

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
                <Timeline data={data} dataKey='key' lines={lines} brush={true} brushRange={range}/>
            </div>
        )
    }


}


test('render update brush properties', () => {
    const wrapper = mount(<StatefulTimeline/>);
    expect(html(wrapper)).toMatchSnapshot();
    wrapper.find('#update-mock-data').simulate('click');
    expect(html(wrapper)).toMatchSnapshot();
});




