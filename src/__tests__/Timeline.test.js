import React from 'react';
import Timeline from '../Timeline';
import {mockData, mockLines} from './Timeline.tester';

test('render empty timeline', () => {

    const wrapper = mount(<Timeline data={[]}/>);
    expect(html(wrapper)).toMatchSnapshot();

});

test('render with sample data', () => {

    const wrapper = mount(<Timeline data={mockData({size: 3})}/>);
    expect(html(wrapper)).toMatchSnapshot();

});

test('render with lines', () => {

    const wrapper = mount(<Timeline data={mockData({size: 3})} lines={mockLines({size: 10})}/>);
    expect(html(wrapper)).toMatchSnapshot();

});

test('render without label', () => {

    const wrapper = mount(<Timeline data={mockData({size: 3})} label={false}/>);
    expect(html(wrapper)).toMatchSnapshot();

});

test('render with custom track height', () => {

    const wrapper = mount(<Timeline data={mockData({size: 3})} trackHeight={40}/>);
    expect(html(wrapper)).toMatchSnapshot();

});
// test('render with range', () => {
//
//     const data = mockData({size: 3});
//     const range = mockRange(data);
//     const wrapper = mount(<Timeline data={data} range={range}/>);
//     expect(html(wrapper)).toMatchSnapshot();
//
// });

// test('render with brush', () => {
//
//     const data = mockData({size: 3});
//     const range = mockRange(data);
//     const wrapper = mount(<Timeline data={data} brush={true} brushRange={range}/>);
//     expect(html(wrapper)).toMatchSnapshot();
//
// });
