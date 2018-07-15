import React from 'react';
import renderer from 'react-test-renderer';
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