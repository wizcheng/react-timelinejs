import React from 'react';
import {StatefulTimeline} from "./StatefulTimeline";

test('render update brush properties', () => {
    const wrapper = mount(<StatefulTimeline/>);
    expect(html(wrapper)).toMatchSnapshot();
    wrapper.find('#update-mock-data').simulate('click');
    expect(html(wrapper)).toMatchSnapshot();
});




