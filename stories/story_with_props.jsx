import React from 'react';
import Timeline from '../src/Timeline';
import {mockData, mockLines, mockRange} from "../src/__tests__/Timeline.tester";
import * as R from 'ramda';
import moment from 'moment';
import ReactResizeDetector from 'react-resize-detector';


const formatDate = value => {

    return moment(value).format('MMMM Do YYYY, h:mm:ss a')
};

class Range extends React.Component {


    render() {

        const {range} = this.props;

        return <div>
            Range:&nbsp;
            {
                range ?
                    <div style={{display: 'inline'}}>{formatDate(range[0])} - {formatDate(range[1])}</div> :
                    <div style={{display: 'inline'}}>NA</div>
            }
        </div>


    }

}

export default class StoryWithProps extends React.Component {

    constructor(props){
        super(props);

        const data = mockData({size: R.defaultTo(30, props.dataSize)});
        const domain = mockRange(data);
        this.state = {
            data: data,
            lines: mockLines({size: 10, interval: 12}),
            domain: domain
        }
    }

    render() {

        return (
            <div style={{overflow: 'hidden'}}>
                <ReactResizeDetector handleWidth handleHeight>
                    {(width, height) => <Timeline data={this.state.data}
                                                  dataKey='key'
                                                  lines={this.state.lines}
                                                  width={width} height={400}
                                                  range={this.state.domain}
                                                  onMouseover={val => {}}/>}
                </ReactResizeDetector>
            </div>
        );
    }
}
