import moment from 'moment';
import seedrandom from 'seedrandom';
import * as R from 'ramda';

const random = seedrandom('test-seed');


export const mockRange = (data) => {
    const min = R.reduce(R.min, Number.MAX_VALUE, data.map(d => d.start.getTime()));
    const max = R.reduce(R.max, 0, data.map(d => d.end.getTime()));
    const duration = max - min;
    const from = new Date(min + duration / 4);
    const to = new Date(min + duration / 4 * 3);
    console.log('from/to', from, to);
    return [from, to];
};


export const mockLines = ({size = 10, date = moment('2018-07-14'), interval = 1}) => {
    const today = date.clone().hours(0).minutes(0).seconds(0).milliseconds(0);
    const results = [];
    for (let i = 0; i < size; i++) {
        results.push({
            date: today.clone().add(i*interval, 'hours'),
            className: 'test'
        });
    }
    return results;
};


export const mockData = ({size = 10, date = moment('2018-07-14'), breakdown = true}) => {

    const today = date.clone().hours(0).minutes(0).seconds(0).milliseconds(0);

    const arr = [];
    for (let i = 0; i < size; i++) {

        const start = today.clone().add(Math.round(random() * 100) * (10 + random() * 10), 'minutes').add(i * 20, 'minutes');
        const factor = random() < 0.1 ? 1000 : 100;
        const end = start.clone().add(Math.round(random() * factor + 10), 'minutes');
        const duration = end.toDate().getTime() - start.toDate().getTime();
        const steps = !breakdown ? [] : [
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
        ];
        arr.push({
            start: start.toDate(),
            end: end.toDate(),
            label: `event ${i}`,
            steps
        })

    }
    return arr;

};

