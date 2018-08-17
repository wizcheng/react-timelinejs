import React from 'react';
import Timeline from '../Timeline';
import {mockData, mockLines, mockRange} from './Timeline.tester';

test('render with range', () => {

    const data = mockData({size: 3});
    const lines = mockLines({size: 10});
    const range = mockRange(data);
    const wrapper = mount(<Timeline id={'1'} data={data} range={range} lines={lines}/>);
    expect(html(wrapper)).toMatchSnapshot();

});
