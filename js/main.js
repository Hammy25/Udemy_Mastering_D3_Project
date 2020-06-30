/*
Controller file.
Event handling happens here.
*/ 

// For logging the console
const cl = (value) => {
  console.log("Looking for me: ");
  console.log(value);
};

// Global variables
// Charts
var mainChart, donutChart, unitsBarChart, revenueBarChart, durationBarChart, timeline;
// dates 
var dates = [];
// teams
var teams = [];

// Array containing sizes of companies
var sizesArray = ["large", "medium", "small"];

// Time parse to  convert String date to date objects
var timeParser = d3.timeParse("%d/%m/%Y");

// Sorting in ascending order
const ascendingSort = (array) => {
  array.sort((a, b) => a-b);
  return array;
};

// Event handler for the brush
const brushed = () => {
      var selection = d3.event.selection || timeline.x.range();
      var newValues = selection.map(timeline.x.invert)
      // changeDates(newValues)
      mainChart.wrangleData(newValues);
      donutChart.wrangleData(newValues);
      unitsBarChart.wrangleData(newValues);
      revenueBarChart.wrangleData(newValues);
      durationBarChart.wrangleData(newValues);
}

// Return a value function
const getValues = (value) => { return value;}

//Loading data and initializing visualizations
d3.json("./data/calls.json").then( data => {

  data.forEach(item => {
    if(dates.indexOf(item.date) < 0){
      dates.push(item.date);
    }
    item.date = timeParser(item.date);
    if(this.teams.indexOf(item.team) == -1){
        this.teams.push(item.team);
    }
  });

  allCalls = data;
  calls = data;
  dates = ascendingSort(dates.map( date => timeParser(date)));

  mainChart = new StackedAreaChart("#stacked-area");
  donutChart = new DonutChart("#company-size");
  unitsBarChart = new BarChart("#units-sold", "units_sold");
  revenueBarChart = new BarChart("#revenue", "call_revenue");
  durationBarChart = new BarChart("#call-duration", "call_duration");
  timeline = new Timeline("#timeline", calls);

  // Event handling
  $("#var-select").change( () => {
      mainChart.wrangleData();
      timeline.wrangleData();
  });



}).catch((error) => {
  console.log("An error occured: ");
  console.log(error);
})


