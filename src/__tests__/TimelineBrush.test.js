import React from 'react';
import Timeline from '../Timeline';
import {mockData, mockRange} from './Timeline.tester';

test('render with brush', () => {

    const data = mockData({size: 3});
    const range = mockRange(data);
    const wrapper = mount(<Timeline id={'1'} data={data} brush={true} brushRange={range}/>);
    expect(html(wrapper)).toMatchSnapshot();

});
