import React from 'react';

import { storiesOf } from '@storybook/react';

import Timeline from '../src/Timeline';
import {mockData, mockLines} from "../src/__tests__/Timeline.tester";
import StoryWithBrush from './story_with_brush';
import './story.css';

storiesOf('Timeline', module)
    .add('basic', () => <Timeline data={mockData({size: 30, breakdown: false})} width={500} height={300}/>)
    .add('with breakdown', () => <Timeline data={mockData({size: 30})} width={500} height={300}/>)
    .add('with lines', () => <Timeline data={mockData({size: 30})} width={500} height={300} lines={mockLines({size: 100})}/>)
    .add('with brush and no label', () => <Timeline data={mockData({size: 30})} width={500} height={100} label={false} brush={true}/>)
    .add('interactive timeline', () => <StoryWithBrush/>)
    .add('interactive timeline, with default', () => <StoryWithBrush defaultRange={true}/>)
;
