/*
  Code for stacked area chart.
*/

//Defining stacked area chart class
class StackedAreaChart{

  constructor(_parentElement){
    this.parentElement = _parentElement;

    this.initializeChart();
  }


  initializeChart(){
    var vis = this;

    // Dimensions
    vis.margin = {top: 50, right: 50, bottom: 50, left: 100};
    vis.height = 300;
    vis.width = 600;

    // Transitions
    vis.t = () => { return d3.transition().ease(d3.easeLinear).duration(1000); }

    // Creating svg canvas
    vis.stackSvg = d3.select(vis.parentElement).append("svg")
                                        .attr("preserveAspectRatio", "xMinYMin meet")
                                        .attr("viewBox", "0 0 750 400")
                                        .classed(".svg-content", true);

    // Creating plotting area
    vis.stackedChart = vis.stackSvg.append("g")
                          .attr("id", "stacked-area-chart")
                          .attr("width", vis.width)
                          .attr("height", vis.height)
                          .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Defining scales
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);
    vis.xScale = d3.scaleTime().range([0, vis.width]);
    vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // Defining axes
    vis.xAxis = d3.axisBottom()
                  .ticks(12)
                  .scale(vis.xScale);

    vis.yAxis = d3.axisLeft()
                  .scale(vis.yScale)

    // Initializing stack layout
    vis.stack = d3.stack();
    vis.stack.order(d3.stackOrderNone);
    vis.stack.offset(d3.stackOffsetNone);

    // Defining area paths
    vis.area = d3.area()
                 .x((d) => {
                  // console.log(d.data.date);
                  return vis.xScale(new Date (d.data.date))
                })
                 .y0((d) => vis.yScale(d[0]))
                 .y1((d) => vis.yScale(d[1]));

    // Legend
    vis.legendContainer = vis.stackSvg.append("g");

    var dataL = 0;
    var offset = 80;
          
    vis.legend = vis.legendContainer.selectAll(".legends")
                                .data(teams)
                                .enter().append("g")
                                .attr("class", "legends")
                                .attr("transform", (d, i) => {
                                       if (i === 0) {
                                          dataL = d.length + offset 
                                          return "translate(" + vis.width/3 +"," + vis.margin.top/2 + ")"
                                      } else { 
                                       var newdataL = dataL
                                       dataL +=  d.length + offset
                                       return "translate(" + ((newdataL)+(vis.width/3)) + "," + vis.margin.top/2 + ")"
                                      }
                                  });
              
    vis.legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 10)
          .attr("height", 10)
          .attr("stroke", "black")
          .style("fill", d => vis.colorScale(d));
          
    vis.legend.append("text")
          .attr("x", 20)
          .attr("y", 10)
          .text( d => d)
          .attr("class", "textselected")
          .style("text-anchor", "start")
          .style("font-size", 15)

    vis.wrangleData();
  }


  wrangleData(values){
    var vis = this;

    vis.dataKey = $("#var-select").val();

    if(values != undefined){
      calls = allCalls.filter(function(d){
          return ((d.date > values[0]) && (d.date < values[1]))
      })
    }else{
      calls = allCalls;
    }
    // Formatting data to feed to stack layout
    vis.dayNest = d3.nest()
        .key(function(d){ return d.date; })
        .entries(calls);

    vis.dataArray = vis.dayNest
        .map(function(day){
            // console.log(day.values);
            return day.values.reduce(function(accumulator, current){
                accumulator.date = day.key;
                accumulator[current.team] = accumulator[current.team] + current[vis.dataKey];
                return accumulator;
            }, {
                "northeast": 0,
                "midwest": 0,
                "south": 0,
                "west": 0
            })
        });


    // Determine maximum
    vis.maxSum = d3.max(vis.dataArray, (d) => {
      var vals = d3.keys(d).map((key) => { return key !== "date" ? d[key] : 0 });
      return d3.sum(vals);
    });

    vis.updateChart();
  }


  updateChart(){
    var vis = this;

    //Get domains of scales
    vis.yScale.domain([0, vis.maxSum]);
    vis.xScale.domain(d3.extent(vis.dataArray.map( d => new Date (d.date))));
    vis.colorScale.domain(teams);
    vis.stack.keys(teams);

    // Removing previous axes
    vis.stackedChart.selectAll("g").remove();

    // console.log(vis.stack(vis.dataArray))
    // Drawing the area 
    vis.chart = vis.stackedChart.selectAll(".browser").data(vis.stack(vis.dataArray));

    vis.chart.exit().remove();

    vis.areas = vis.chart.enter().append("g").attr("class", d => "browser " + d.key).attr("fill-opacity", 0.7);

    vis.areas.append("path")
         .attr("class", "area")
         .attr("fill", d => vis.colorScale(d.key))
         .attr("fill-opacity", 0.2)
         .transition(vis.t())
         .attr("d", vis.area)
         .attr("fill-opacity", 0.7);
         

    // Appending axes to graph
    vis.stackedChart.append("g")
         .attr("class", "x-axis")
         .attr("transform", "translate(0," + vis.height + ")")
         .transition(vis.t())
         .call(vis.xAxis);

    vis.stackedChart.append("g")
         .attr("class", "y-axis")
         .transition(vis.t())
         .call(vis.yAxis);

    // Labels for axes
    d3.select("#x-label").remove(); 
    vis.XaxisLabel = vis.stackSvg.append("text")
                         .attr("id", "x-label")
                         .attr("x", ((vis.width + vis.margin.left + vis.margin.right)/2))
                         .attr("y", (vis.height + vis.margin.top + (vis.margin.bottom/1.5)))
                         .attr("text-anchor", "middle")
                         .text("Date");

    d3.select("#y-label").remove();                     

    var yText = "";
    if(vis.dataKey === "units_sold"){
        yText = "Units Sold";
      }else if(vis.dataKey === "call_revenue"){
        yText = "Revenue (USD)";
      }else{
        yText = "Duration (Seconds)";
      }

    vis.YaxisLabel = vis.stackSvg.append("text")
                         .attr("id", "y-label")
                         .attr("transform", "rotate(-90)")
                         .attr("x", 0 - ((vis.height + vis.margin.left + vis.margin.right)/2))
                         .attr("y", vis.margin.left/4)
                         .attr("dy", "1em")
                         .attr("text-anchorvis.", "start")
                         .text(yText);

  }
}
