import React from 'react';
import Timeline from '../src/Timeline';
import {mockData, mockLines, mockRange} from "../src/__tests__/Timeline.tester";
import * as R from 'ramda';
import moment from 'moment';


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

export default class StoryWithBrush extends React.Component {

    constructor(props){
        super(props);

        const data = mockData({size: R.defaultTo(30, props.dataSize)});
        const domain = props.defaultRange ? mockRange(data) : null;
        this.state = {
            data: data,
            lines: mockLines({size: 10, interval: 12}),
            domain: domain
        }
    }

    updateData = () => {
        const data = mockData({size: R.defaultTo(30, this.props.dataSize)});
        let domain;
        if (this.state.domain) {
            domain = this.state.domain;
        } else {
            domain = this.props.defaultRange ? mockRange(data) : null;
        }
        this.setState({
            data: data,
            domain: domain
        })
    };

    handleBrush = domain => {
        this.setState({domain})
    };

    render() {

        const {showButton} = this.props;
        return (
            <div>

                {!showButton ? null : <button id='generate-button' onClick={this.updateData}>Generate Random Data</button>}

                <Range range={this.state.domain}/>

                <Timeline data={this.state.data}
                          lines={this.state.lines}
                          width={500} height={250}
                          range={this.state.domain}
                          onMouseover={val => {}}/>

                <Timeline data={this.state.data}
                          lines={this.state.lines}
                          width={500} height={80} trackHeight={6}
                          label={false} tooltips={false}
                          brush={true} onBrush={this.handleBrush} brushRange={this.state.domain}/>
            </div>
        );
    }
}
