import React from 'react';
import timeline from './TimelineModel';
import './Timeline.css';
import equals from 'ramda/src/equals';
import PropTypes from 'prop-types';

const propTypes = {
    data: PropTypes.array.isRequired,
    lines: PropTypes.array,

    dataKey: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    trackHeight: PropTypes.number,
    label: PropTypes.bool,
    tooltips: PropTypes.bool,
    tooltipContent: PropTypes.func,
    brush: PropTypes.bool,
    brushRange: PropTypes.array,
    range: PropTypes.array,
    onBrush: PropTypes.func,
    onMouseover: PropTypes.func,
    onClick: PropTypes.func,
};

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
        if (!equals(nextProps.data, this.props.data)
                || !equals(nextProps.lines, this.props.lines)) {
            this.timelineFn
                .data(nextProps.data)
                .lines(nextProps.lines)
                .update()
                .updateRange(nextProps.range)
                .updateBrushRange(nextProps.brushRange)
                .redraw();
        }
        if (!equals(nextProps.range, this.props.range)){
            this.timelineFn.updateRange(nextProps.range);
        }
        if (!equals(nextProps.brushRange, this.props.brushRange)){
            this.timelineFn.updateBrushRange(nextProps.brushRange);
        }
    }

    createTimeline = () => {

        const {data, dataKey, lines, height, width, trackHeight, label, tooltips, tooltipContent, brush, brushRange, onBrush, onMouseover, onClick, range} = this.props;
        const config = {
            dataKey,
            width,
            height,
            trackHeight,
            label,
            tooltips,
            tooltipContent,
            brush,
            brushRange,
            range,
            onBrush,
            onMouseover,
            onClick
        };
        this.timelineFn = timeline(this.div, config).create(data, lines);
        this.timelineFn.redraw();
    };

    render() {
        return <div ref={input => this.div = input}/>
    }
}

Timeline.propTypes = propTypes;
// Timeline.defaultProps = defaultProps;

export default Timeline;
