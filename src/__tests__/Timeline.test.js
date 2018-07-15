import React from 'react';
import Timeline from '../Timeline';
import {mockData} from './Timeline.tester';

test('render empty timeline', () => {

    const timeline = mount(<Timeline data={[]}/>);
    expect(timeline).toMatchSnapshot();

});

test('render with sample data', () => {

    const timeline = mount(<Timeline data={mockData({size: 3})}/>);
    expect(timeline).toMatchSnapshot();

});

test('render without label', () => {

    const timeline = mount(<Timeline data={mockData({size: 3})} label={false}/>);
    expect(timeline).toMatchSnapshot();

});

// test('render with range', () => {
//
//     const data = mockData({size: 3});
//     const range = mockRange(data);
//     const timeline = mount(<Timeline data={data} range={range}/>);
//     expect(timeline.html()).toMatchSnapshot();
//
// });

// test('render with brush', () => {
//
//     const data = mockData({size: 3});
//     const range = mockRange(data);
//     const timeline = mount(<Timeline data={data} brush={true} brushRange={range}/>);
//     expect(timeline).toMatchSnapshot();
//
// });