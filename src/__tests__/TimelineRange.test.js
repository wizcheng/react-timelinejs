import React from 'react';
import Timeline from '../Timeline';
import {mockData, mockRange} from './Timeline.tester';

test('render with range', () => {

    const data = mockData({size: 3});
    const range = mockRange(data);
    const timeline = mount(<Timeline data={data} range={range}/>);
    expect(timeline.html()).toMatchSnapshot();

});
