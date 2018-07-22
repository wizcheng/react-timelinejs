# react-timelinejs [![Build Status](https://travis-ci.org/wizcheng/react-timelinejs.svg?branch=master)](https://travis-ci.org/wizcheng/react-timelinejs) [![NPM version](https://badge.fury.io/js/react-timelinejs.svg)](https://yarnpkg.org/en/package/react-timelinejs) [![Known Vulnerabilities](https://snyk.io/test/github/wizcheng/react-timelinejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/wizcheng/react-timelinejs?targetFile=package.json) [![CodeFactor](https://www.codefactor.io/repository/github/wizcheng/react-timelinejs/badge)](https://www.codefactor.io/repository/github/wizcheng/react-timelinejs) [![BCH compliance](https://bettercodehub.com/edge/badge/wizcheng/react-timelinejs?branch=master)](https://bettercodehub.com/)


React Timeline component

### Live Demo

For examples of timeline, go to https://wizcheng.github.io/react-timelinejs


## Getting Started

### Install 

```sh
yarn add -D react-timelinejs
```

### Usage

```jsx
import Timeline from 'react-timelinejs';
...


const data = [
    {
        start: new Date('2018-07-12T13:14:15'),
        end: new Date('2018-07-12T15:14:15'),
        label: 'My First Event 1'
    },
    {
        start: new Date('2018-07-16:14:15'),
        end: new Date('2018-07-12T17:14:15'),
        label: 'My First Event 2'
    },
    {
        start: new Date('2018-07-12T12:14:15'),
        end: new Date('2018-07-12T19:14:15'),
        label: 'My Second Event'
    }
];

...
<Timeline data={data}/>

```

### Properties

| Props | Type | Default | Description |
| -------------- | ------ | ------ | ---------------------------- |
| data | Array | [] | List of time line events, minimum values start,end,label |
| lines | Array | [] | List of lines, minimum values date, className |
| dataKey | string | null | key of data, passed to d3js, to optimize modification detection |
| width | number | 700 | width of whole widget |
| height | number | 400 | height of whole widget |
| trackHeight | number | 20 | Max height of each track |
| label | bool | true | Show label on the track or not |
| tooltips | bool | true | Show tooltip on mouseover |
| tooltipContent | func | TBA | function (d) => {}, to return content of tooltip |
| brush | bool | false | Show brush |
| brushRange | Array | null | brush range, \[start, end\] | 
| range | Array | null | range of data to focus, \[start, end\] |
| onBrush | func | null | callback on brush change |
| onMouseover | func | null | callback on mouseover event |
| onClick | func | null | callback on mouse click event, (d) => {} | 


### Custom Styles

TBA
