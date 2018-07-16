import * as d3 from 'd3';
import * as R from 'ramda';

const defaultTo = (defaultValue, value) => {
    if (value === null || typeof value === 'undefined') {
        return defaultValue;
    }
    return value;
};

const defaultNoOps = fn => {
    return defaultTo(() => {
    }, fn);
};

const timeline = (domElement, overrideConfig) => {

    //--------------------------------------------------------------------------
    //
    // chart
    //

    // const defaultConfig = {
    //     width: 700,
    //     height: 400,
    //     label: true
    // };

    const config = {
        width: defaultTo(700, overrideConfig.width),
        height: defaultTo(400, overrideConfig.height),
        label: defaultTo(true, overrideConfig.label),
        tooltips: defaultTo(true, overrideConfig.tooltips),
        brush: defaultTo(false, overrideConfig.brush),
        brushRange: defaultTo(false, overrideConfig.brushRange),
        range: defaultTo(false, overrideConfig.range),
        onBrush: defaultNoOps(overrideConfig.onBrush),
        onMouseover: defaultNoOps(overrideConfig.onMouseover)
    };

    // chart geometry
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        outerWidth = config.width,
        outerHeight = config.height,
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    // global timeline variables
    var timeline = {},   // The timeline
        data = {},       // Container for the data
        components = [], // All the components of the timeline for redrawing
        bandGap = 25,    // Arbitray gap between to consecutive bands
        bands = {},      // Registry for all the bands in the timeline
        bandY = 0,       // Y-Position of the next band
        bandNum = 0;     // Count of bands for ids

    // Create svg element
    var svg = d3.select(domElement).append("svg")
        .attr("class", "svg")
        .attr("id", "svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");


    function mousemove() {
        const band = bands['mainBand'];
        const x = d3.mouse(this)[0];
        const y = d3.mouse(this)[1];
        const mouseOverDate = band.xScale.invert(x);
        band.mousemove([mouseOverDate, 0]);
        config.onMouseover({date: mouseOverDate, x, y});
    }

    svg
        .on('mousemove', mousemove)
        .on('mouseover', () => {const band = bands['mainBand']; band.mouseover()})
        .on('mouseout', () => {const band = bands['mainBand']; band.mouseout()})
    ;

    svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var chart = svg.append("g")
        .attr("class", "chart")
        .attr("clip-path", "url(#chart-area)" );

    var tooltip = d3.select(domElement)
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "visible");

    //--------------------------------------------------------------------------
    //
    // data
    //

    timeline.lines = function (lines) {
        data.lines = lines ? lines : [];
        return timeline;
    };

    timeline.data = function(items) {

        var today = new Date(),
            tracks = [],
            yearMillis = 31622400000,
            instantOffset = 100 * yearMillis;

        data.items = items;

        function showItems(n) {
            var count = 0, n = n || 10;
            items.forEach(function (d) {
                count++;
                if (count > n) return;
            })
        }

        function compareAscending(item1, item2) {
            // Every item must have two fields: 'start' and 'end'.
            var result = item1.start - item2.start;
            // earlier first
            if (result < 0) { return -1; }
            if (result > 0) { return 1; }
            // longer first
            result = item2.end - item1.end;
            if (result < 0) { return -1; }
            if (result > 0) { return 1; }
            return 0;
        }

        function compareDescending(item1, item2) {
            // Every item must have two fields: 'start' and 'end'.
            var result = item1.start - item2.start;
            // later first
            if (result < 0) { return 1; }
            if (result > 0) { return -1; }
            // shorter first
            result = item2.end - item1.end;
            if (result < 0) { return 1; }
            if (result > 0) { return -1; }
            return 0;
        }

        function calculateTracks(items, sortOrder, timeOrder) {
            var i, track;

            sortOrder = sortOrder || "descending"; // "ascending", "descending"
            timeOrder = timeOrder || "backward";   // "forward", "backward"

            function sortBackward() {
                // older items end deeper
                items.forEach(function (item) {
                    for (i = 0, track = 0; i < tracks.length; i++, track++) {
                        if (item.end < tracks[i]) { break; }
                    }
                    item.track = track;
                    tracks[track] = item.start;
                });
            }
            function sortForward() {
                // younger items end deeper
                items.forEach(function (item) {
                    for (i = 0, track = 0; i < tracks.length; i++, track++) {
                        if (item.start > tracks[i]) { break; }
                    }
                    item.track = track;
                    tracks[track] = item.end;
                });
            }

            if (sortOrder === "ascending")
                data.items.sort(compareAscending);
            else
                data.items.sort(compareDescending);

            if (timeOrder === "forward")
                sortForward();
            else
                sortBackward();
        }

        // Convert yearStrings into dates
        data.items.forEach(function (item){

            const steps = item.steps;

            const start = item.start.getTime();
            const end = item.end.getTime();
            const scale = value => {
                return (value - start) / (end - start);
            };
            steps.forEach(step => {
                step.startPercentage = scale(step.start.getTime());
                step.endPercentage = scale(step.end.getTime());
            })

            // item.start = parseDate(item.start);
            // if (item.end == "") {
            //     //console.log("1 item.start: " + item.start);
            //     //console.log("2 item.end: " + item.end);
            //     item.end = new Date(item.start.getTime() + instantOffset);
            //     //console.log("3 item.end: " + item.end);
            //     item.instant = true;
            // } else {
            //     //console.log("4 item.end: " + item.end);
            //     item.end = parseDate(item.end);
            //     item.instant = false;
            // }
            // The timeline never reaches into the future.
            // This is an arbitrary decision.
            // Comment out, if dates in the future should be allowed.
            // if (item.end > today) { item.end = today};
            item.instant = false;
        });

        //calculateTracks(data.items);
        // Show patterns
        //calculateTracks(data.items, "ascending", "backward");
        //calculateTracks(data.items, "descending", "forward");
        // Show real data
        calculateTracks(data.items, "descending", "backward");
        //calculateTracks(data.items, "ascending", "forward");
        data.nTracks = tracks.length;
        data.minDate = d3.min(data.items, function (d) { return d.start; });
        data.maxDate = d3.max(data.items, function (d) { return d.end; });

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // band
    //

    timeline.band = function (bandName) {

        var band = {};
        band.id = "band" + bandNum;
        band.x = 0;
        band.y = bandY;
        band.w = width;
        band.h = height - 20;
        band.trackOffset = 4;
        // Prevent tracks from getting too high
        band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks, 20);
        band.itemHeight = band.trackHeight * 0.8,
            band.parts = [],
            band.instantWidth = 100; // arbitray value

        band.xScale = d3.scaleTime()
            .domain([data.minDate, data.maxDate])
            .range([0, band.w]);

        band.yScale = function (track) {
            return band.trackOffset + track * band.trackHeight;
        };

        // band.gBelow = chart.append("g")
        //     .attr("id", `${band.id}-below`)
        //     .attr("transform", "translate(0," + band.y +  ")");

        band.g = chart.append("g")
            .attr("id", band.id)
            .attr("transform", "translate(0," + band.y +  ")");

        band.g.append("rect")
            .attr("class", "band")
            .attr("width", band.w)
            .attr("height", band.h);

        const lines = band.g.selectAll('line.path')
            .data(data.lines)
            .enter().append('path')
            .attr('d', d => {
                const x = band.xScale(d.date);
                return `M${x} 0 L${x} ${band.h}`
            })
            .attr('class', d => `line ${d.className}`);

        const mouseoverLine = band.g.append('path')
            .attr('d', `M0 0 L0 ${band.h}`)
            .attr('class', 'mouseover-line')
            .style('display', 'none')
        ;

        // Items
        const items = band.g.selectAll("g")
            .data(data.items)
            .enter().append("svg")
            .attr("y", function (d) { return band.yScale(d.track); })
            .attr("height", band.itemHeight)
            .attr("class", function (d) { return d.instant ? "part instant" : "part interval";});

        var intervals = svg.select("#band" + bandNum).selectAll(".interval");
        intervals.append("rect")
            .attr("width", "100%")
            .attr("height", "100%");
        intervals.selectAll('rect.step')
            .data(d => d.steps)
            .enter()
            .append('rect')
            .attr('class', ds => `step ${ds.className}`)
            .attr('x', ds => `${ds.startPercentage*100}%`)
            .attr('y', 0)
            .attr('width', ds => `${(ds.endPercentage - ds.startPercentage)*100}%`)
            .attr('height', band.itemHeight)
        ;

        if (config.label) {
            intervals.append("text")
                .attr("class", "intervalLabel")
                .attr("x", 1)
                .attr("y", 10)
                .text(function (d) { return d.label; });
        }

        var instants = svg.select("#band" + bandNum).selectAll(".instant");
        instants.append("circle")
            .attr("cx", band.itemHeight / 2)
            .attr("cy", band.itemHeight / 2)
            .attr("r", 5);

        if (config.label){
            instants.append("text")
                .attr("class", "instantLabel")
                .attr("x", 15)
                .attr("y", 10)
                .text(function (d) { return d.label; });
        }

        band.addActions = function(actions) {
            // actions - array: [[trigger, function], ...]
            actions.forEach(function (action) {
                items.on(action[0], action[1]);
            })
        };


        band.redraw = function () {
            items
                .attr("x", function (d) { return band.xScale(d.start);})
                .attr("width", function (d) {
                    return band.xScale(d.end) - band.xScale(d.start); });

            lines
                .attr('d', d => {
                    const x = band.xScale(d.date);
                    return `M${x} 0 L${x} ${band.h}`
                });

            band.parts.forEach(function(part) { part.redraw(); })

            // mouseoverLine
            //     .attr("x", function (d) { return band.xScale(band.mouseoverPos[0]);})
        };

        band.mousemove = (xy) => {
            const x = band.xScale(xy[0]);
            mouseoverLine
                .attr('d', `M${x} 0 L${x} ${band.h}`);
        };
        band.mouseout = () => {
            mouseoverLine.style('display', 'none');
        };
        band.mouseover = () => {
            mouseoverLine.style('display', null);
        };


        bands[bandName] = band;
        components.push(band);
        // Adjust values for next band
        bandY += band.h + bandGap;
        bandNum += 1;

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // labels
    //

    timeline.labels = function (bandName) {

        var band = bands[bandName],
            labelWidth = 46,
            labelHeight = 20,
            labelTop = band.y + band.h - 10,
            y = band.y + band.h + 1,
            yText = 15;

        var labelDefs = [
            ["start", "bandMinMaxLabel", 0, 4,
                function(min, max) { return format(min); },
                "Start of the selected interval", band.x + 30, labelTop],
            ["end", "bandMinMaxLabel", band.w - labelWidth, band.w - 4,
                function(min, max) { return format(max); },
                "End of the selected interval", band.x + band.w - 152, labelTop],
            ["middle", "bandMidLabel", (band.w - labelWidth) / 2, band.w / 2,
                function(min, max) { return max.getUTCFullYear() - min.getUTCFullYear(); },
                "Length of the selected interval", band.x + band.w / 2 - 75, labelTop]
        ];

        var bandLabels = chart.append("g")
            .attr("id", bandName + "Labels")
            .attr("transform", "translate(0," + (band.y + band.h + 1) +  ")")
            .selectAll("#" + bandName + "Labels")
            .data(labelDefs)
            .enter().append("g")
            .on("mouseover", function(d) {
                tooltip.html(d[5])
                    .style("top", d[7] + "px")
                    .style("left", d[6] + "px")
                    .style("visibility", "visible");
            })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            });

        bandLabels.append("rect")
            .attr("class", "bandLabel")
            .attr("x", function(d) { return d[2];})
            .attr("width", labelWidth)
            .attr("height", labelHeight)
            .style("opacity", 1);

        var labels = bandLabels.append("text")
            .attr("class", function(d) { return d[1];})
            .attr("id", function(d) { return d[0];})
            .attr("x", function(d) { return d[3];})
            .attr("y", yText)
            .attr("text-anchor", function(d) { return d[0];});

        labels.redraw = function () {
            var min = band.xScale.domain()[0],
                max = band.xScale.domain()[1];

            labels.text(function (d) { return d[4](min, max); })
        };

        band.parts.push(labels);
        components.push(labels);

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // tooltips
    //

    timeline.tooltips = function (bandName) {

        var band = bands[bandName];

        band.addActions([
            // trigger, function
            ["mouseover", showTooltip],
            ["mouseout", hideTooltip]
        ]);

        function getHtml(element, d) {
            return d.label + "<br>" + format(d.start) + " - " + format(d.end);
        }

        function showTooltip (d) {

            var x = d3.event.pageX < band.x + band.w / 2
                ? d3.event.pageX + 10
                : d3.event.pageX - 110,
                y = d3.event.pageY < band.y + band.h / 2
                    ? d3.event.pageY + 30
                    : d3.event.pageY - 30;

            tooltip
                .html(getHtml(d3.select(this), d))
                .style("top", y + "px")
                .style("left", x + "px")
                .style("visibility", "visible");
        }

        function hideTooltip () {
            tooltip.style("visibility", "hidden");
        }

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // xAxis
    //

    timeline.xAxis = function (bandName, orientation) {

        var band = bands[bandName];

        // var axis = d3.svg.axis()
        //     .scale(band.xScale)
        //     .orient(orientation || "bottom")
        //     .tickSize(6, 0)
        //     .tickFormat(function (d) { return toYear(d); });
        const axis = d3.axisBottom(band.xScale);

        var xAxis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (band.y + band.h)  + ")");

        xAxis.redraw = function () {
            xAxis.call(axis);
        };

        band.parts.push(xAxis); // for brush.redraw
        components.push(xAxis); // for timeline.redraw

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // brush
    //

    timeline.updateRange = domain => {
        const band = bands['mainBand'];
        band.xScale.domain(domain);
        band.redraw();
        return timeline;
    };

    timeline.brush = function (bandName) {

        var band = bands[bandName];

        const brush = d3.brushX()
            .extent([[0, 0], [band.w, band.h]])
            .on("brush", function() {
                const domain = d3.event.selection
                    ? [band.xScale.invert(d3.event.selection[0]), band.xScale.invert(d3.event.selection[1])]
                    : band.xScale.domain();

                // console.log('domain', domain);
                band.range = domain;
                config.onBrush(domain);
                // targetNames.forEach(function(d) {
                //     bands[d].xScale.domain(domain);
                //     bands[d].redraw();
                // });
            });

        band.brush = brush;

        var xBrush = band.g.append("svg")
            .attr("class", "x brush")
            .call(brush);

        xBrush.selectAll("rect")
            .attr("y", 4)
            .attr("height", band.h - 4);
        band.xBrush = xBrush;

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // redraw
    //

    timeline.redraw = function () {
        console.log('redraw');
        components.forEach(function (component) {
            component.redraw();
        })
    };

    //--------------------------------------------------------------------------
    //
    // Utility functions
    //

    function parseDate(dateString) {
        return dateString;
        // // 'dateString' must either conform to the ISO date format YYYY-MM-DD
        // // or be a full year without month and day.
        // // AD years may not contain letters, only digits '0'-'9'!
        // // Invalid AD years: '10 AD', '1234 AD', '500 CE', '300 n.Chr.'
        // // Valid AD years: '1', '99', '2013'
        // // BC years must contain letters or negative numbers!
        // // Valid BC years: '1 BC', '-1', '12 BCE', '10 v.Chr.', '-384'
        // // A dateString of '0' will be converted to '1 BC'.
        // // Because JavaScript can't define AD years between 0..99,
        // // these years require a special treatment.
        //
        // var format = d3.time.format("%Y-%m-%d"),
        //     date,
        //     year;
        //
        // date = format.parse(dateString);
        // if (date !== null) return date;
        //
        // // BC yearStrings are not numbers!
        // if (isNaN(dateString)) { // Handle BC year
        //     // Remove non-digits, convert to negative number
        //     year = -(dateString.replace(/[^0-9]/g, ""));
        // } else { // Handle AD year
        //     // Convert to positive number
        //     year = +dateString;
        // }
        // if (year < 0 || year > 99) { // 'Normal' dates
        //     date = new Date(year, 6, 1);
        // } else if (year == 0) { // Year 0 is '1 BC'
        //     date = new Date (-1, 6, 1);
        // } else { // Create arbitrary year and then set the correct year
        //     // For full years, I chose to set the date to mid year (1st of July).
        //     date = new Date(year, 6, 1);
        //     date.setUTCFullYear(("0000" + year).slice(-4));
        // }
        // // Finally create the date
        // return date;
    }

    function format(date, bcString) {
        return date.toString();
        // // bcString is the prefix or postfix for BC dates.
        // // If bcString starts with '-' (minus),
        // // if will be placed in front of the year.
        // bcString = bcString || " BC" // With blank!
        // var year = date.getUTCFullYear();
        // if (year > 0) return year.toString();
        // if (bcString[0] == '-') return bcString + (-year);
        // return (-year) + bcString;
    }

    timeline.updateBrushRange = range => {

        if (range) {
            const band = bands['mainBand'];
            if (!R.equals(range, band.range)){
                const start = band.xScale(range[0]);
                const end = band.xScale(range[1]);
                if (!isNaN(start) && !isNaN(end)) {
                    band.xBrush.call(band.brush.move, [start, end]);
                }
            }
        }

    };

    timeline.create = (data, lines) => {
        timeline
            .data(data)
            .lines(lines)
            .band("mainBand")
            // .band("naviBand", 0.08)
            .xAxis("mainBand");

        if (config.tooltips) {
            timeline.tooltips("mainBand");
        }

        if (config.brush) {
            timeline.brush('mainBand');
            if (config.brushRange){
                timeline.updateBrushRange(config.brushRange);
            }
        }

        if (config.range){
            timeline.updateRange(config.range);
        }
        return timeline;
    };

    return timeline;
}

export default timeline;