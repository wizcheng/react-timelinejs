import React from 'react';
import timeline from './TimelineModel';
import './Timeline.css';
import equals from 'ramda/src/equals';
import defaultTo from 'ramda/src/defaultTo';
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
        this.createTimeline(this.props);
    }


    componentDidUpdate() {
    }

    componentWillUnmount() {
        this.removeTimeline();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (!equals(this.props.width, nextProps.width)
                || !equals(this.props.height, nextProps.height)) {
            this.removeTimeline();
            this.createTimeline(nextProps);
        } else {
            let shouldUpdate = false;
            if (nextProps.dataTime) {
                shouldUpdate = !equals(nextProps.dataTime, this.props.dataTime)
            } else {
                shouldUpdate = !equals(nextProps.data, this.props.data)
                    || !equals(nextProps.lines, this.props.lines);
            }
            if (shouldUpdate) {
                this.timelineFn
                    .data(nextProps.data, nextProps.dataRange)
                    .lines(nextProps.lines)
                    .update()
                    .updateRange(nextProps.range)
                    .updateBrushRange(nextProps.brushRange)
                    .redraw();
            } else {
                if (!equals(nextProps.range, this.props.range)){
                    this.timelineFn.updateRange(nextProps.range);
                }
                if (!equals(nextProps.brushRange, this.props.brushRange)){
                    this.timelineFn.updateBrushRange(nextProps.brushRange);
                }
            }
        }
    }

    removeTimeline = () => {
        this.timelineFn.destroy()
    };

    createTimeline = (props) => {

        const {id, data, dataKey, dataRange, lines, height, width, trackHeight, label, tooltips, tooltipContent, brush, brushRange, onBrush, onBrushEnd, onMouseover, onClick, range} = props;
        const config = {
            dataKey,
            dataRange,
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
            onBrushEnd,
            onMouseover,
            onClick,
            id: defaultTo(Math.round(Math.random() * 100000).toFixed(0) + '-' + new Date().getTime(), id)
        };
        this.timelineFn = timeline(this.div, config).create(data, lines, dataRange);
        this.timelineFn.redraw();
    };

    render() {
        return <div ref={input => this.div = input}/>
    }
}

Timeline.propTypes = propTypes;
// Timeline.defaultProps = defaultProps;

export default Timeline;
