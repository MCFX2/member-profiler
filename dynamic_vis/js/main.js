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

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margins.left + ", " + margins.top  + ")");

var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");

var yAxisGroup = g.append("g")
    .attr("class", "y axis");

/* We begin the definition of the scales here because these attributes
are not dependent on the live data. We will modify onlt the necessary attributes
in the update loop. */
// X Scale
var x = d3.scaleBand() //ordinal
    .range([0, width])
    .padding(0.2);

/* Again, notice that we are not defining every attribute. We will modify what needs to be updated
in the update loop. */
// X Label
/*
g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

    */

var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Y Label
var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Times read from");

//========================Data Loading=======================
/* Load the raw data file, anything that's local gets worked with within this async function. d3 can handle these
three file types; csv, tsv, and json.
IMPORTANT: This call is new to D3 v5. You may need to modify code that you take from the internet for compatibility */

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

    //what happens at each n milliseconds interval.
    //This is basically our automatic update loop. Use it for time-based automated tasks.
    // This sets up d3 behind the scenes.
    // is not run on the first frame.
    /*d3.interval(function(){
        var newData = flag ? data : data.slice(1);

        update(newData)
        flag = !flag
    }, 1000);

    */

    console.log(tData);

    //set up permanent stuff

    //X axis is constant after data is loaded
    x.domain(Object.keys(tData[0]));

    var xAxisCall = d3.axisBottom(x);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxisCall);

    drawSummaryChart(tData);
    // Run the update in the first frame.
    //update(tData);
});

var points = [];

const SELECTED_BACK = -2;
var cSelectedData = -1; 

var yGeneral = d3.scaleLog()
    .range([height, 0]);

var ySpecific = d3.scaleLinear()
    .range([height, 0]);

var yAxisGeneralCall = d3.axisLeft(yGeneral)
    .ticks(5);

var yAxisSpecificCall = d3.axisLeft(ySpecific)
    .ticks(5);

var curYAxis;

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
    ySpecific.domain([0, yMax]);

    curYAxis.transition()
        .duration(100)
        .call(yAxisSpecificCall);


    //scales now set up

    for(const key in tData[index])
    {
        points.push(g.selectAll("rect" + key)
            .data([0])
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", x(key))
            .attr("y", ySpecific(tData[index][key].timesReadFrom))
            .attr("width", x.bandwidth)
            .attr("height", height - ySpecific(tData[index][key].timesReadFrom))
            .attr("fill", "red")
        );
    }


    cSelectedData = SELECTED_BACK;


}

svg.on("click", () => {
    if(cSelectedData > -1)
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
});

function drawSummaryChart(data)
{

    //remove all points from specific overview chart
    for(const idx in points)
    {
        points[idx].remove();
    }
    points = [];


    let yMax = d3.max(data.map(d => {
        var cMax = 0;
        for (const item in d)
        {
            if(d[item].timesReadFrom > cMax) cMax = d[item].timesReadFrom;
        }
        return cMax;
    }));

    // Y Scale
    yGeneral.domain([1, yMax]);

    if(!curYAxis)
    {
        curYAxis = g.append("g")
            .attr("class", "y-axis")
            .call(yAxisGeneralCall);
    }
    else
    {
        curYAxis.transition()
        .duration(100)
        .call(yAxisGeneralCall);
    }
        
            
    //draw points

    for(const idx in data)
    {
        for(const idx2 in data[idx])
        {
            points.push(svg.selectAll("indPoints")
            .data([0])
            .enter()
            .append("circle")
                .attr("cx", x(idx2) + Math.random() * 20 + margins.left + 22)
                .attr("cy", yGeneral(data[idx][idx2].timesReadFrom) + margins.top)
                .attr("r", 2)
                .style("fill", data[idx][idx2].timesReadFrom ? "gray" : "red")
                .on("mouseover", _ => {
                    cSelectedData = idx;
                    div.transition()
                        .duration(1)
                        .style("opacity", .9);
                    div.html("Times read from: " + data[idx][idx2].timesReadFrom + "</br>Transform ID: " + idx)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", _ => {
                    cSelectedData = -1;
                    div.transition()
                        .duration(2000)
                        .style("opacity", 0);
                }));
        }
    }

    cSelectedData = -1;
}

/*
function update(data) {
    var value = flag ? "revenue" : "profit";

    //revisit scales and axes
    x.domain(data.map(function(d){ return d.month }));
    y.domain([0, d3.max(data, function(d) { return d[value] })]);

    // X Axis
    var xAxisCall = d3.axisBottom(x);
    xAxisGroup.transition(t).call(xAxisCall);

    // Y Axis
    var yAxisCall = d3.axisLeft(y)
        .tickFormat(function(d){ return "$" + d; });
    yAxisGroup.transition(t).call(yAxisCall);

    /* VERY  IMPORTANT */
    /* This is the bread and butter of D3. selectAll first joins the all html objects with
    corresponding data using the ranges and other objects. It then seperates them into
    two lists, depending on whether the objects data reference has an old, same, or new signature
    The EXIT list is all old elements that dont have references in the present data set.
    The ENTER list contains all new entering elements based on new data AS WELL AS old elements with
    references in the present data. */

    // JOIN new data with old elements. One element for each month.
/*    var rects = g.selectAll("rect")
        .data(data, function(d){
            return d.month;
        });

    // EXIT old elements not present in new data.
    rects.exit()
        .attr("fill", "red")
        .transition(t)
        .attr("y", y(0))
        .attr("height", 0)
        .remove();

    // ENTER new elements present in new data...
    rects.enter()
        .append("rect")
        .attr("fill", "grey")
        .attr("y", y(0))
        .attr("height", 0)
        .attr("x", function(d){ return x(d.month) })
        .attr("width", x.bandwidth)
        // AND UPDATE old elements present in new data.
        .merge(rects)
        .transition(t)
        .attr("x", function(d){ return x(d.month) })
        .attr("width", x.bandwidth)
        .attr("y", function(d){ return y(d[value]); })
        .attr("height", function(d){ return height - y(d[value]); });

    //update label text
    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);

}
*/

// //similar to our
// function update(data) {
//     var label = flag ? "Revenue" : "Profit";
//
//     //revisit the scales and axes
//     x.domain(data.map(function(d){ return d.month }));
//     y.domain([0, d3.max(data, function(d) { return d[value] })]);
//
//     // X Axis
//     var xAxisCall = d3.axisBottom(x);
//     xAxisGroup.transition(t).call(xAxisCall);
//
//     // Y Axis
//     var yAxisCall = d3.axisLeft(y)
//         .tickFormat(function(d){ return "$" + d; });
//     yAxisGroup.transition(t).call(yAxisCall);
//
//     /* VERY  IMPORTANT */
//     /* This is the bread and butter of D3. d3.interval first joins the all html objects with
//     corresponding data using the ranges and other objects. It then seperaates them into
//     two lists, depending on whether the objects data reference has an old, same, or new signature
//     The EXIT list is all old elements that dont have references in the present data set.
//     The Enter list contains all new entering elements based on new data AS WELL AS old elements with
//     references in the present data. */
//
//     // JOIN new data with old elements. One element for each month.
//     var rects = g.selectAll("rect")
//         .data(data, function(d){
//             return d.month;
//         });
//
//     // EXIT old elements not present in new data.
//     rects.exit()
//         .attr("fill", "red")
//     .transition(t)
//         .attr("y", y(0))
//         .attr("height", 0)
//         .remove();
//
//     // ENTER new elements present in new data...
//     rects.enter()
//         .append("rect")
//             .attr("fill", "grey")
//             .attr("y", y(0))
//             .attr("height", 0)
//             .attr("x", function(d){ return x(d.month) })
//             .attr("width", x.bandwidth)
//             // AND UPDATE old elements present in new data.
//             .merge(rects)
//             .transition(t)
//                 .attr("x", function(d){ return x(d.month) })
//                 .attr("width", x.bandwidth)
//                 .attr("y", function(d){ return y(d[value]); })
//                 .attr("height", function(d){ return height - y(d[value]); });
//
//     //update the label text
//     var label = flag ? "Revenue" : "Profit";
//     yLabel.text(label);
//
// }
