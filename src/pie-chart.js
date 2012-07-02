dc.pieChart = function(selector) {
    var NO_FILTER = null;

    var sliceCssClass = "pie-slice";

    var anchor;
    var root;

    var colors = d3.scale.category20c();

    var dimension;
    var group;

    var width = 0, height = 0, radius = 0, innerRadius = 0;

    var _filter = NO_FILTER;

    var chart = {};

    chart.render = function() {
        root.select("svg").remove();

        if (chart.dataAreSet()) {
            var topG = chart.generateTopLevelG();

            var dataPie = d3.layout.pie().value(function(d) {
                return d.value;
            });

            var arcs = chart.buildArcs();

            var slices = chart.drawSlices(topG, dataPie, arcs);

            chart.drawLabels(slices, arcs);

            chart.highlightFilter();
        }
    };

    chart.select = function(s) {
        return root.select(s);
    };

    chart.selectAll = function(s) {
        return root.selectAll(s);
    };

    chart.anchor = function(a) {
        if (!arguments.length) return anchor;
        anchor = a;
        root = d3.select(anchor);
        return chart;
    };

    chart.innerRadius = function(r) {
        if (!arguments.length) return innerRadius;
        innerRadius = r;
        return chart;
    };

    chart.colors = function(c) {
        if (!arguments.length) return colors;
        colors = c;
        return chart;
    };

    chart.dimension = function(d) {
        if (!arguments.length) return dimension;
        dimension = d;
        return chart;
    };

    chart.group = function(g) {
        if (!arguments.length) return group;
        group = g;
        return chart;
    };

    chart.filter = function(f) {
        dimension.filter(f);
        return chart;
    };

    chart.width = function(w) {
        if (!arguments.length) return width;
        width = w;
        return chart;
    };

    chart.height = function(h) {
        if (!arguments.length) return height;
        height = h;
        return chart;
    };

    chart.radius = function(r) {
        if (!arguments.length) return radius;
        radius = r;
        return chart;
    };

    chart.filter = function(f) {
        if (!arguments.length) return _filter;

        _filter = f;
        chart.highlightFilter();
        if (chart.dataAreSet())
            dimension.filter(_filter);

        return chart;
    };

    chart.filterAll = function() {
        return chart.filter(NO_FILTER);
    };

    chart.hasFilter = function() {
        return _filter != NO_FILTER;
    };

    chart.generateTopLevelG = function() {
        return root.append("svg")
            .data([group.all()])
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + chart.cx() + "," + chart.cy() + ")");
    };

    chart.cx = function() {
        return width / 2;
    };

    chart.cy = function() {
        return height / 2;
    };

    chart.buildArcs = function() {
        return d3.svg.arc().outerRadius(radius).innerRadius(innerRadius);
    };

    chart.drawSlices = function(topG, dataPie, arcs) {
        var slices = topG.selectAll("g." + sliceCssClass)
            .data(dataPie)
            .enter()
            .append("g")
            .attr("class", sliceCssClass);

        slices.append("path")
            .attr("fill", function(d, i) {
                return colors(i);
            })
            .attr("d", arcs)
            .on("click", function(d) {
                chart.filter(d.data.key);
                dc.renderAll();
            });

        return slices;
    };

    chart.drawLabels = function(slices, arcs) {
        slices.append("text")
            .attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = radius;
                var centroid = arcs.centroid(d);
                if (isNaN(centroid[0]) || isNaN(centroid[1])) {
                    return "translate(0,0)";
                } else {
                    return "translate(" + centroid + ")";
                }
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                var data = d.data;

                if (data.value == 0)
                    return "";

                return data.key;
            });
    };

    chart.isSelectedSlice = function(d) {
        return _filter == d.data.key;
    };

    chart.highlightFilter = function() {
        if (_filter) {
            root.selectAll("g." + sliceCssClass).select("path").each(function(d) {
                if (chart.isSelectedSlice(d)) {
                    d3.select(this).attr("fill-opacity", 1)
                        .attr('stroke', "#ccc")
                        .attr('stroke-width', 3);
                } else {
                    d3.select(this).attr("fill-opacity", 0.1)
                        .attr('stroke-width', 0);
                }
            });
        }
    };

    chart.dataAreSet = function() {
        return dimension != undefined && group != undefined;
    };

    dc.registerChart(chart);

    return chart.anchor(selector);
};
