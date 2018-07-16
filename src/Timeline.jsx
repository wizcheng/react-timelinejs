import React from 'react';
import timeline from './TimelineModel';
import './Timeline.css';
import * as R from 'ramda';


// const propTypes = {
//     label: PropTypes.string.isRequired,
//     onChange: PropTypes.func.isRequired,
//     styles: PropTypes.object
// };
//
// const defaultProps = {
//     styles: {
//         label: {
//             fontFamily: 'Comic Sans MS',
//             color: 'green'
//         },
//         input: {
//             background: '#ddd',
//             border: '1px solid red'
//         }
//     }
// };

class Timeline extends React.Component {

    componentDidMount() {
        this.key = Math.round(Math.random() * 100000).toFixed(0) + '-' + new Date().getTime();
        this.createTimeline();
    }


    componentDidUpdate() {
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (!R.equals(nextProps.range, this.props.range)){
            this.timelineFn.updateRange(nextProps.range);
        }
        if (!R.equals(nextProps.brushRange, this.props.brushRange)){
            this.timelineFn.updateBrushRange(nextProps.brushRange);
        }
    }

    createTimeline = () => {

        const {data, lines, height, width, label, tooltips, brush, brushRange, onBrush, onMouseover, range} = this.props;
        const config = {
            width,
            height,
            label,
            tooltips,
            brush,
            brushRange,
            range,
            onBrush,
            onMouseover
        };
        this.timelineFn = timeline(this.div, config).create(data, lines);
        this.timelineFn.redraw();
    };

    render() {
        return <div ref={input => this.div = input}/>
    }
}

// Timeline.propTypes = propTypes;
// Timeline.defaultProps = defaultProps;

export default Timeline;
