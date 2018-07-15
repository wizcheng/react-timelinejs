import moment from 'moment';
import seedrandom from 'seedrandom';

const random = seedrandom('test-seed');

export const mockData = ({size = 10, date = moment('2018-07-14')}) => {

    const today = date.clone().hours(0).minutes(0).seconds(0).milliseconds(0);

    const arr = [];
    for (let i = 0; i < size; i++) {

        const start = today.clone().add(Math.round(random() * 100) * (10 + random() * 10), 'minutes').add(i * 20, 'minutes');
        const factor = random() < 0.1 ? 1000 : 100;
        const end = start.clone().add(Math.round(random() * factor + 10), 'minutes');
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

};

