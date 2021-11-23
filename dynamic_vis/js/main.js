//============================GLOBALS============================
/* you should define anything up here that stays static throughout your visualization. It is the design of your
visualization that determines if a variable/svg/axis/etc. should remain in the global space or should
be animated/updated etc. Typically, you will put things here that are not dependent on the data.
 */

// define margins in pixels. Use these to define total space allotted for this chart, within the chart area.
// For multiple charts, you can define multiple margin arrays
var margins = { left:100, right:40, top:50, bottom:150};

//define chart sizes
var width = 800 - margins.left - margins.right;
var height = 400 - margins.top - margins.bottom;

//used to swap between data tables
var flag = true;

//define the transition times in milliseconds
var t = d3.transition().duration(750);

//grab entire body
//d3.select() grabs html objects and can modify them. Here you are designating a block of space

function defineChartSvg(htmlElement)
{
    return d3.select(htmlElement)
    .append("svg")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom);
}

var svgRead = defineChartSvg("#chart-area-read");
var svgWrite = defineChartSvg("#chart-area-write");
var svgPoint = defineChartSvg("#chart-area-point");
var svgDeref = defineChartSvg("#chart-area-deref");

function defineChartGlobal(svgBase)
{
    return svgBase.append("g")
    .attr("transform", "translate(" + margins.left + ", " + margins.top  + ")");
}

var gRead = defineChartGlobal(svgRead);
var gWrite = defineChartGlobal(svgWrite);
var gPoint = defineChartGlobal(svgPoint);
var gDeref = defineChartGlobal(svgDeref);

function defineXAxisGroup(globBase)
{
    return globBase.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");
}

var xAxisGroupRead = defineXAxisGroup(gRead);
var xAxisGroupWrite = defineXAxisGroup(gWrite);
var xAxisGroupPoint = defineXAxisGroup(gPoint);
var xAxisGroupDeref = defineXAxisGroup(gDeref);

function defineYAxisGroup(globBase)
{
    return globBase.append("g")
    .attr("class", "y axis");
}

var yAxisGroupRead = defineYAxisGroup(gRead);
var yAxisGroupWrite = defineYAxisGroup(gWrite);
var yAxisGroupPoint = defineYAxisGroup(gPoint);
var yAxisGroupDeref = defineYAxisGroup(gDeref);

/* We begin the definition of the scales here because these attributes
are not dependent on the live data. We will modify onlt the necessary attributes
in the update loop. */
// X Scale
var x = d3.scaleBand() //ordinal
    .range([0, width])
    .padding(0.2);

//tooltip div
var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


function defineYLabel(gObj, lbl)
{
    return gObj.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    //.attr("transform", "translate(" + idx * Y_OFFSET + ", 0)")
    .attr("transform", "rotate(-90)")
    .text(lbl);
}

// Y Labels
var yLabelRead = defineYLabel(gRead, "Times read from");
var yLabelWrite = defineYLabel(gWrite, "Times written to");
var yLabelPoint = defineYLabel(gPoint, "Times pointed to");
var yLabelDeref = defineYLabel(gDeref, "Times dereferenced");

function callXAxis(globBase, call)
{
    globBase.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(call);
}

var tData = [];

d3.csv("data/transform.csv").then(data => {
    // Clean data
    data.forEach(function(d) {
        if(tData[Number(d.category)])
        {
            tData[Number(d.category)][d.variable] =
            {
                varrSize: Number(d.varrSize),
                timesPointedTo: Number(d.timesPointedTo),
                timesDereferenced: Number(d.timesDereferenced),
                timesWrittenTo: Number(d.timesWrittenTo) + 1, //instrumenter doesn't count constructor but we will
                timesReadFrom: Number(d.timesReadFrom)
            };
        }
        else
        {
            tData[Number(d.category)] = [];

            tData[Number(d.category)][d.variable] =
            {
                varrSize: Number(d.varrSize),
                timesPointedTo: Number(d.timesPointedTo),
                timesDereferenced: Number(d.timesDereferenced),
                timesWrittenTo: Number(d.timesWrittenTo) + 1, //instrumenter doesn't count constructor but we will
                timesReadFrom: Number(d.timesReadFrom)
            };
        }

    });

    console.log(tData);

    //set up permanent stuff

    //X axis is constant after data is loaded
    x.domain(Object.keys(tData[0]));

    var xAxisCall = d3.axisBottom(x);

    callXAxis(gRead, xAxisCall);
    callXAxis(gWrite, xAxisCall);
    callXAxis(gPoint, xAxisCall);
    callXAxis(gDeref, xAxisCall);
    
    drawSummaryChart(tData);
});

var points = [];

const SELECTED_BACK = -2;
const SELECTED_NONE = -1;
var cSelectedData = SELECTED_NONE; 

function defineYGeneralScale()
{
    return d3.scaleLog()
        .range([height, 0]);
}

function defineYSpecificScale()
{
    return d3.scaleLinear()
        .range([height, 0]);
}

var yGeneralRead = defineYGeneralScale();
var yGeneralWrite = defineYGeneralScale();
var yGeneralPoint = defineYGeneralScale();
var yGeneralDeref = defineYGeneralScale();

var ySpecificRead = defineYSpecificScale();
var ySpecificWrite = defineYSpecificScale();
var ySpecificPoint = defineYSpecificScale();
var ySpecificDeref = defineYSpecificScale();

function defineYAxisGeneralCall(axis)
{
    return d3.axisLeft(axis)
        .ticks(5);
}

var yAxisGeneralCallRead = defineYAxisGeneralCall(yGeneralRead);
var yAxisGeneralCallWrite = defineYAxisGeneralCall(yGeneralWrite);
var yAxisGeneralCallPoint = defineYAxisGeneralCall(yGeneralPoint);
var yAxisGeneralCallDeref = defineYAxisGeneralCall(yGeneralDeref);

var yAxisSpecificCallRead = defineYAxisGeneralCall(ySpecificRead);
var yAxisSpecificCallWrite = defineYAxisGeneralCall(ySpecificWrite);
var yAxisSpecificCallPoint = defineYAxisGeneralCall(ySpecificPoint);
var yAxisSpecificCallDeref = defineYAxisGeneralCall(ySpecificDeref);

var curYAxes = [];

function getMaxAttribNested(data, accessor)
{
    let yMax = 0;
    for(const k in data)
    {
        let tv = accessor(data[k]);
        yMax = tv > yMax ? tv : yMax;
    }
    return yMax;
}

function makeBars(globBase, data, yAxis, accessor)
{
    for(const key in data)
    {
        points.push(globBase.selectAll("rect" + key)
            .data([0])
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", x(key))
            .attr("y", yAxis(accessor(data[key])))
            .attr("width", x.bandwidth)
            .attr("height", height - yAxis(accessor(data[key])))
            .attr("fill", "blue")
        );
    }
}

function drawSpecificChart(index)
{
    //remove all points from summary chart
    for(const idx in points)
    {
        points[idx].remove();
    }
    points = [];

    //set up new Y axis, X axis never changes

    let yMax = 0; 
    for(const k in tData[index])
    {
        let tv = tData[index][k].timesReadFrom;
        yMax = tv > yMax ? tv : yMax;
    }

    // Y Scale
    ySpecificRead.domain([0, getMaxAttribNested(tData[index], d => d.timesReadFrom)])
    ySpecificWrite.domain([0, getMaxAttribNested(tData[index], d => d.timesWrittenTo)])
    ySpecificPoint.domain([0, getMaxAttribNested(tData[index], d => d.timesPointedTo)])
    ySpecificDeref.domain([0, getMaxAttribNested(tData[index], d => d.timesDereferenced)])


    curYAxes[0].transition()
        .duration(100)
        .call(yAxisSpecificCallRead);
    curYAxes[1].transition()
        .duration(100)
        .call(yAxisSpecificCallWrite);
    curYAxes[2].transition()
        .duration(100)
        .call(yAxisSpecificCallPoint);
    curYAxes[3].transition()
        .duration(100)
        .call(yAxisSpecificCallDeref);

    //scales now set up

    makeBars(gRead, tData[index], ySpecificRead, d => d.timesReadFrom);
    makeBars(gWrite, tData[index], ySpecificWrite, d => d.timesWrittenTo);
    makeBars(gPoint, tData[index], ySpecificPoint, d => d.timesPointedTo);
    makeBars(gDeref, tData[index], ySpecificDeref, d => d.timesDereferenced);

    cSelectedData = SELECTED_BACK;

}

function clickToggle()
{
    if(cSelectedData != SELECTED_NONE && cSelectedData != SELECTED_BACK)
    {
        div.transition()
            .duration(1)
            .style("opacity", 0);
        
        drawSpecificChart(cSelectedData);
    }
    else if(cSelectedData == SELECTED_BACK)
    {
        drawSummaryChart(tData);
    }
}

svgRead.on("click", clickToggle);
svgWrite.on("click", clickToggle);
svgPoint.on("click", clickToggle);
svgDeref.on("click", clickToggle);

function getMaxAttrib(data, accessor)
{
    return d3.max(data.map(d => {
        var cMax = 0;
        for (const item in d)
        {
            let temp = accessor(d[item]);
            if(temp > cMax) cMax = temp;
        }
        return cMax;
    }));
}

function createInitialYAxis(globBase, call)
{
    return globBase.append("g")
        .attr("class", "y-axis")
        .call(call);
}

function createPoint(svg, data, idx, idx2, yAxis, accessor, tooltipLabel)
{
    return svg.selectAll("indPoints")
    .data([0])
    .enter()
    .append("circle")
        .attr("cx", x(idx2) + Math.random() * 20 + margins.left + 22)
        .attr("cy", yAxis(accessor(data[idx][idx2])) + margins.top)
        .attr("r", 2)
        .style("fill", accessor(data[idx][idx2]) ? "gray" : "red")
        .on("mouseover", _ => {
            cSelectedData = idx;
            div.transition()
                .duration(1)
                .style("opacity", .9);
            div.html(tooltipLabel + ": " + accessor(data[idx][idx2]) + "</br>ID: " + idx)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", _ => {
            cSelectedData = -1;
            div.transition()
                .duration(2000)
                .style("opacity", 0);
        })
}

function createPointgroup(svg, data, axis, accessor, tooltipLabel)
{
    for(const idx in data)
    {
        for(const idx2 in data[idx])
        {
            points.push(createPoint(svg, data, idx, idx2, axis, accessor, tooltipLabel));
        }
    }
}

function drawSummaryChart(data)
{

    //remove all points from specific overview chart
    for(const idx in points)
    {
        points[idx].remove();
    }
    points = [];

    // Y Scale
    yGeneralRead.domain([1, getMaxAttrib(data, d => d.timesReadFrom)]);
    yGeneralWrite.domain([1, getMaxAttrib(data, d => d.timesWrittenTo)]);
    yGeneralPoint.domain([1, getMaxAttrib(data, d => d.timesPointedTo)]);
    yGeneralDeref.domain([1, getMaxAttrib(data, d => d.timesDereferenced)]);

    if(curYAxes.length == 0)
    {
        curYAxes.push(createInitialYAxis(gRead, yAxisGeneralCallRead));
        curYAxes.push(createInitialYAxis(gWrite, yAxisGeneralCallWrite));
        curYAxes.push(createInitialYAxis(gPoint, yAxisGeneralCallPoint));
        curYAxes.push(createInitialYAxis(gDeref, yAxisGeneralCallDeref));
    }
    else
    {
        curYAxes[0].transition()
            .duration(100)
            .call(yAxisGeneralCallRead);
        curYAxes[1].transition()
            .duration(100)
            .call(yAxisGeneralCallWrite);
        curYAxes[2].transition()
            .duration(100)
            .call(yAxisGeneralCallPoint);
        curYAxes[3].transition()
            .duration(100)
            .call(yAxisGeneralCallDeref);
    }
        
            
    //draw points

    createPointgroup(svgRead, data, yGeneralRead, d => d.timesReadFrom, "Times read from");
    createPointgroup(svgWrite, data, yGeneralWrite, d => d.timesWrittenTo, "Times written to");
    createPointgroup(svgPoint, data, yGeneralPoint, d => d.timesPointedTo, "Times pointed to");
    createPointgroup(svgDeref, data, yGeneralDeref, d => d.timesDereferenced, "Times dereferenced");


    cSelectedData = -1;
}
