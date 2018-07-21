import React from 'react';
import Timeline from '../Timeline';
import {mockData, mockLines} from './Timeline.tester';

class StatefulTimeline extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data: mockData({size: 3}),
            lines: mockLines({})
        }
    }

    updateMockData = () => {
        this.setState({
            data: mockData({size: 4}),
            lines: mockLines({})
        });
    };

    render() {

        const {data, lines} = this.state;
        return (
            <div>
                <button id='update-mock-data' onClick={this.updateMockData}>generate</button>
                <Timeline data={data} lines={lines}/>
            </div>
        )
    }


}


test('render update data properties', () => {

    const wrapper = mount(<StatefulTimeline/>);
    expect(html(wrapper)).toMatchSnapshot();
    wrapper.find('#update-mock-data').simulate('click')
    expect(html(wrapper)).toMatchSnapshot();

});

