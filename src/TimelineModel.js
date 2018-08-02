import defaultTo from 'ramda/src/defaultTo';
import equals from 'ramda/src/equals';
import {select, event, mouse} from 'd3-selection';
import {axisBottom} from 'd3-axis';
import {brushX} from 'd3-brush';
import {scaleTime} from 'd3-scale';
import {min, max} from 'd3-array';

const defaultNoOps = fn => {
    return defaultTo(() => {
    }, fn);
};

Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};


function format(date) {
    return date.toString();
}

function getHtml(d, element) {
    return d.label + "<br>" + format(d.start) + " - " + format(d.end);
}

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
        dataKey: overrideConfig.dataKey ? (d) => d[overrideConfig.dataKey] : null,
        width: defaultTo(700, overrideConfig.width),
        height: defaultTo(400, overrideConfig.height),
        trackHeight: defaultTo(20, overrideConfig.trackHeight),
        label: defaultTo(true, overrideConfig.label),
        tooltips: defaultTo(true, overrideConfig.tooltips),
        brush: defaultTo(false, overrideConfig.brush),
        brushRange: defaultTo(false, overrideConfig.brushRange),
        range: defaultTo(false, overrideConfig.range),
        dataRange: defaultTo(null, overrideConfig.dataRange),
        onBrush: defaultNoOps(overrideConfig.onBrush),
        onBrushEnd: defaultNoOps(overrideConfig.onBrushEnd),
        onMouseover: defaultNoOps(overrideConfig.onMouseover),
        onClick: defaultNoOps(overrideConfig.onClick),
        tooltipContent: defaultTo(getHtml, overrideConfig.tooltipContent)
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
        bandNum = 0,
        // id = `${new Date().getTime()}-${Math.random() * 100000}`,
        tooltipId = `tooltip`
    ;     // Count of bands for ids

    // Create svg element
    var svg = select(domElement).append("svg")
        .attr("class", "svg")
        .attr("id", 'svg')
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");


    function mousemove() {
        const band = bands['mainBand'];
        const x = mouse(this)[0];
        const y = mouse(this)[1];
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

    const tooltip = select(domElement)
        .append("div")
        .attr("class", "tooltip")
        .attr('id', tooltipId)
        .style("visibility", "hidden");


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

        if (config.dataRange) {
            data.minDate = options.dataRange[0];
            data.maxDate = options.dataRange[1];
        } else {
            data.minDate = min(data.items, function (d) { return d.start; });
            data.maxDate = max(data.items, function (d) { return d.end; });
        }

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // band
    //

    timeline.update = function () {
        const band = bands['mainBand'];
        band.update();
        return timeline;
    };

    timeline.band = function (bandName) {

        var band = {};
        band.id = "band" + bandNum;
        band.x = 0;
        band.y = bandY;
        band.w = width;
        band.h = height - 20;
        band.trackOffset = 4;
        // Prevent tracks from getting too high
        band.parts = [];
        band.instantWidth = 100; // arbitray value

        band.createOrUpdateXScale = () => {
            if (!band.xScale) {
                band.xScale = scaleTime()
                    .range([0, band.w]);
            }
            band.xScale.domain([data.minDate, data.maxDate]);
        };
        band.createOrUpdateYScale = () => {
            band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks, config.trackHeight);
            band.itemHeight = Math.max(band.trackHeight -1, band.trackHeight * 0.8);
            band.yScale = function (track) {
                return band.trackOffset + track * band.trackHeight;
            };
        };

        band.createOrUpdateXScale();
        band.createOrUpdateYScale();

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


        band.createOrUpdateLines = () => {

            if (!band.lines){
                band.lines = band.g.selectAll('line.path');
            }

            const orgLines = band.lines
                .data(data.lines);

            const newlines = orgLines.enter()
                .append('path')
                .attr('class', d => `line ${d.className}`);

            orgLines.exit().remove();

            band.lines =
                orgLines.merge(newlines)
                .attr('d', d => {
                    const x = band.xScale(d.date);
                    return `M${x} 0 L${x} ${band.h}`
                })
                .attr('class', d => `line ${d.className}`);

        };
        band.createOrUpdateLines();

        const mouseoverLine = band.g.append('path')
            .attr('d', `M0 0 L0 ${band.h}`)
            .attr('class', 'mouseover-line')
            .style('display', 'none')
        ;


        band.createOrUpdateInterval = () => {

            if (!band.items) {
                band.items = band.g.selectAll("g");
            }

            const orgItems = band.items
                .data(data.items, config.dataKey);

            const newItems = orgItems
                .enter()
                .append("svg");

            newItems.append('rect')
                .attr("width", "100%")
                .attr("height", "100%");

            orgItems.exit().remove();

            band.items = orgItems.merge(newItems)
                .attr("y", function (d) {
                    return band.yScale(d.track);
                })
                .attr("height", band.itemHeight)
                .attr("class", function (d) {
                    return d.instant ? "part instant" : "part interval";
                });


            // if (!band.intervals) {
            //     band.intervals = band.g.selectAll(".interval");
            //     band.intervals.append("rect")
            //         .attr("width", "100%")
            //         .attr("height", "100%");
            // }

            // const intervals = band.g.selectAll(".interval");

            // intervals.selectAll('rect').remove();


            // if (!band.steps) {
            //
            //
            //
            // }

            const oldSteps = band.items.selectAll('rect.step')
                .data(d => d.steps);

            const newSteps = oldSteps
                .enter()
                .append('rect');

            oldSteps.exit().remove();

            const steps = oldSteps.merge(newSteps)
                .attr('class', ds => `step ${ds.className}`)
                .attr('x', ds => `${ds.startPercentage * 100}%`)
                .attr('y', 0)
                .attr('width', ds => `${(ds.endPercentage - ds.startPercentage) * 100}%`)
                .attr('height', band.itemHeight)
            ;

            // if (!band.labels) {
            //     band.labels =
            // }

            band.items.selectAll("text").remove();

            if (config.label) {
                band.items.append("text")
                    .attr("class", "intervalLabel")
                    .attr("x", 1)
                    .attr("y", 10)
                    .text(function (d) {
                        return d.label;
                    });
            }

            // band.intervals = intervals;

        };
        band.createOrUpdateInterval();

        // var instants = svg.select("#band" + bandNum).selectAll(".instant");
        // instants.append("circle")
        //     .attr("cx", band.itemHeight / 2)
        //     .attr("cy", band.itemHeight / 2)
        //     .attr("r", 5);
        //
        // if (config.label){
        //     instants.append("text")
        //         .attr("class", "instantLabel")
        //         .attr("x", 15)
        //         .attr("y", 10)
        //         .text(function (d) { return d.label; });
        // }

        band.addActions = function(actions) {
            // actions - array: [[trigger, function], ...]
            actions.forEach(function (action) {
                band.items.on(action[0], action[1]);
            })
        };


        band.update = function () {
            band.range = null;
            band.createOrUpdateXScale();
            band.createOrUpdateYScale();
            band.createOrUpdateLines();
            band.createOrUpdateInterval();
        };

        band.redraw = function () {
            band.items
                .attr("x", function (d) { return band.xScale(d.start);})
                .attr("width", function (d) {
                    return band.xScale(d.end) - band.xScale(d.start); });

            band.lines
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

        const band = bands[bandName];

        band.addActions([
            // trigger, function
            ["mouseover", showTooltip],
            ["mouseout", hideTooltip],
            ['click', config.onClick]
        ]);

        function showTooltip (d) {

            var x = event.pageX < band.x + band.w / 2
                ? event.pageX + 10
                : event.pageX - 110,
                y = event.pageY < band.y + band.h / 2
                    ? event.pageY + 30
                    : event.pageY - 30;

            tooltip
                .html(config.tooltipContent(d, select(this)))
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

        const axis = axisBottom(band.xScale);

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
        if (domain == null) {
            return timeline;
        }
        const band = bands['mainBand'];
        band.xScale.domain(domain);
        band.redraw();
        return timeline;
    };

    timeline.brush = function (bandName) {

        var band = bands[bandName];

        const brush = brushX()
            .extent([[0, 0], [band.w, band.h]])
            .on("brush", function() {
                const domain = event.selection
                    ? [band.xScale.invert(event.selection[0]), band.xScale.invert(event.selection[1])]
                    : band.xScale.domain();
                band.range = domain;
                config.onBrush(domain);
            })
            .on("end", function() {
                const domain = event.selection
                    ? [band.xScale.invert(event.selection[0]), band.xScale.invert(event.selection[1])]
                    : band.xScale.domain();
                config.onBrushEnd(domain);
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
        components.forEach(function (component) {
            component.redraw();
        })
    };

    //--------------------------------------------------------------------------
    //
    // Utility functions
    //

    timeline.updateBrushRange = range => {

        if (range) {
            const band = bands['mainBand'];
            if (!equals(range, band.range)){
                const start = band.xScale(range[0]);
                const end = band.xScale(range[1]);
                if (!isNaN(start) && !isNaN(end)) {
                    band.xBrush.call(band.brush.move, [start, end]);
                }
            }
        }

        return timeline;

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
