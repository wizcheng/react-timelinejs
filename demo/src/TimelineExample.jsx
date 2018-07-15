import React from 'react';
import Timeline from "react-timelinejs";
import moment from 'moment';
import './TimelineExample.css';

const data = () => {

    const today = moment('2018-07-14');

    const arr = [];
    for (let i = 0; i < 1000; i++) {

        const start = today.clone().add(Math.round(Math.random() * 100) * (10 + Math.random() * 10), 'minutes').add(i*20, 'minutes');
        const factor = Math.random() < 0.1 ? 1000 : 100;
        const end = start.clone().add(Math.round(Math.random() * factor + 10), 'minutes');
        const duration = end.toDate().getTime() - start.toDate().getTime();
        arr.push({
            start: start.toDate(),
            end: end.toDate(),
            label: `event ${i}`,
            steps: [
                {
                    start: new Date(start.toDate().getTime() + duration / 10),
                    end: new Date(start.toDate().getTime() + duration / 10 * 3),
                    label: 'sub event 1',
                    className: 'custom_1'
                },
                {
                    start: new Date(start.toDate().getTime() + duration / 10 * 4),
                    end: new Date(start.toDate().getTime() + duration / 10 * 5),
                    label: 'sub event 2',
                    className: 'custom_1'
                },
                {
                    start: new Date(start.toDate().getTime() + duration / 10 * 5.5),
                    end: new Date(start.toDate().getTime() + duration / 10 * 7.5),
                    label: 'sub event 3',
                    className: 'custom_1'
                }
            ]
        })

    }
    return arr;

}

export default class TimelineExample extends React.Component {


    constructor(props){
        super(props);
        this.state = {
            data: data(),
            domain: [moment('2018-07-25').toDate(), moment('2018-07-27').toDate()]
        }
    }

    handleBrush = domain => {
        this.setState({domain})
    };

    render() {

        return (
            <div>
                <Timeline data={this.state.data}
                          width={700} height={400}
                          range={this.state.domain}
                            onMouseover={val => console.log(val)}/>

                <Timeline data={this.state.data} width={700} height={100}
                          label={false} tooltips={false}
                          brush={true} onBrush={this.handleBrush} brushRange={this.state.domain}/>
            </div>
        )
    }
}