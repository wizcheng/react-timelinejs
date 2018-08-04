import React from 'react';

import { storiesOf } from '@storybook/react';

import Timeline from '../src/Timeline';
import {mockData, mockLines} from "../src/__tests__/Timeline.tester";
import StoryWithBrush from './story_with_brush';
import './story.css';
import StoryWithProps from "./story_with_props";

storiesOf('Timeline', module)
    .add('basic', () => <Timeline data={mockData({size: 30, breakdown: false})} width={500} height={300}/>)
    .add('with breakdown', () => <Timeline data={mockData({size: 30})} width={500} height={300}/>)
    .add('with lines', () => <Timeline data={mockData({size: 30})} width={500} height={300} lines={mockLines({size: 100, interval:6})}/>)
    .add('with brush and no label', () => <Timeline data={mockData({size: 30})} width={500} height={100} label={false} brush={true}/>)
    .add('with custom track height', () => <Timeline
        data={mockData({size: 30})}
        width={500} height={300}
        trackHeight={40}
    />)
    .add('with custom tooltip', () => <Timeline
        data={mockData({size: 30})}
        width={500} height={300}
        lines={mockLines({size: 100, interval:6})}
        tooltipContent={(item) => {
            return `custom ${item.label} (${item.steps.length} steps)`;
        }}
    />)
    .add('with custom onClick', () => <Timeline
        data={mockData({size: 30})}
        width={500} height={300}
        lines={mockLines({size: 100, interval:6})}
        onClick={(item) => {
            // console.log('item', item);
            alert(`click on ${item.label} (${item.steps.length} steps)`);
        }}
    />)
    .add('interactive timeline', () => <StoryWithBrush/>)
    .add('interactive 1000 events', () => <StoryWithBrush dataSize={1000}/>)
    .add('interactive timeline, with default', () => <StoryWithBrush defaultRange={true}/>)
    .add('update with property change', () => <StoryWithBrush showButton={true}/>)
    .add('update with size', () => <StoryWithProps/>)
;
