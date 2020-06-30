/*

Code for bar charts.

*/

// Defining bar chart class
class BarChart{

	// Define constructor
	constructor(_parentElement, _dataKey){
		this.parentElement = _parentElement;
		this.dataKey = _dataKey;

		this.initializeChart();
	}

	// Initialize chart
	initializeChart(){
		var vis = this;

		// Define margins
		vis.margin = {top: 20, right: 0, bottom: 20, left: 40};
		vis.height = 130;
		vis.width = 300;

		// Transitions
    	vis.t = () => { return d3.transition().duration(1000); }

		//Attach svg to areas
		vis.chart = d3.select(vis.parentElement).append("svg")
                     .attr("preserveAspectRatio", "xMinYMin meet")
                     .attr("viewBox", "0 0 340 170")
                     .classed(".svg-content", true)
                     .append("g")
                     .attr("class", "bar-chart")
                     .attr("width", vis.width)
                     .attr("height", vis.height)
                     .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		//define scales
		vis.xscale = d3.scaleBand()
					  .range([0, vis.width])
					  .paddingInner(0.3)
					  .paddingOuter(0.3);

		vis.yscale = d3.scaleLinear()
					   .range([vis.height, vis.margin.top])


		vis.colorScale = d3.scaleOrdinal(d3.schemePurples[4]);


		//define x and y axes
		vis.xaxis = d3.axisBottom()
		              	 .scale(vis.xscale);

		vis.yaxis = d3.axisLeft()
						 .ticks(5)
		              	 .scale(vis.yscale);

		if(vis.dataKey == "call_duration"){
	    	vis.heading = "Average Call Duration (Seconds)";
	    }else if(vis.dataKey == "call_revenue"){
	    	vis.heading = "Average Call Revenue (USD)";
	    }else{
	    	vis.heading = "Units Sold per Call";
	    }
	    // Title
	    vis.chart.append("text")
	       .attr("class", "title")
	       .attr("x", 0)
	       .attr("y", vis.margin.top / 2)
	       .attr("text-anchor","center")
	       .attr("font-size", 14)
	       .text(vis.heading)


		vis.wrangleData();
	}

	// Wrangle data
	wrangleData(values){
		var vis = this;

	    if(values != undefined){
  			calls = allCalls.filter(function(d){
      		return ((d.date > values[0]) && (d.date < values[1]))
  		})
		}else{
  			calls = allCalls;
		}

		vis.appliancesCount = 0;
		vis.materialsCount = 0;
		vis.electronicsCount = 0;
		vis.furnitureCount = 0;
		vis.appliancesDataTotal = 0;
		vis.materialsDataTotal = 0;
		vis.electronicsDataTotal = 0;
		vis.furnitureDataTotal = 0;

		calls.forEach( item => {
			if(item.category === "appliances"){
				vis.appliancesCount += 1;
				vis.appliancesDataTotal += item[vis.dataKey];
			}else if(item.category === "materials"){
				vis.materialsCount += 1;
				vis.materialsDataTotal += item[vis.dataKey];
			}else if(item.category === "electronics"){
				vis.electronicsCount += 1;
				vis.electronicsDataTotal += item[vis.dataKey];
			}else{
				vis.furnitureCount += 1;
				vis.furnitureDataTotal += item[vis.dataKey];
			}
		});


		
		vis.updateChart();
	}

	//Update chart 
	updateChart(){
		var vis = this;

		vis.xscale.domain(["appliances", "furniture", "electronics", "materials"]);
	    vis.colorScale.domain(["appliances", "furniture", "electronics", "materials"]);
		vis.yscale.domain([0, d3.max([vis.appliancesDataTotal/vis.appliancesCount, vis.furnitureDataTotal/vis.furnitureCount, vis.electronicsDataTotal/vis.electronicsCount, vis.materialsDataTotal/vis.materialsCount])])
		var unitsSoldData = [
		{category: "appliances", unitsSoldAverage: vis.appliancesDataTotal/vis.appliancesCount},
		{category: "furniture", unitsSoldAverage: vis.furnitureDataTotal/vis.furnitureCount},
		{category: "electronics", unitsSoldAverage: vis.electronicsDataTotal/vis.electronicsCount},
		{category: "materials", unitsSoldAverage:  vis.materialsDataTotal/vis.materialsCount},
		];

		console.log(unitsSoldData);

		vis.chart.selectAll("rect").remove();
		vis.chart.selectAll("g").remove();

		vis.bars = vis.chart.selectAll("rect").data(unitsSoldData);

		vis.bars.enter().append("rect")
					    .attr("class", d => d.category)
					    .attr("height", 0)
					    .attr("data-value", d => d.unitsSoldAverage)
					    .attr("width", vis.xscale.bandwidth())
					    .attr("y", d => vis.height)
					    .attr("x", d => vis.xscale(d.category))
					    .transition(vis.t())
					    .attr("fill-opacity", 0.7)
					    .attr("fill", d => vis.colorScale(d.category))
					    .attr("stroke", "black")
						.attr("height", d => vis.height - vis.yscale(d.unitsSoldAverage))
					    .attr("y", d => vis.yscale(d.unitsSoldAverage));

		// Appending axes to graph
	  	vis.chart.append("g")
	       	 .attr("class", "x-axis")
	       	 .attr("transform", "translate(0," + vis.height + ")")
	       	 .transition(vis.t())
	       	 .call(vis.xaxis);

	  	vis.chart.append("g")
	       	 .attr("class", "y-axis")
	       	 .transition(vis.t())
	       	 .call(vis.yaxis);

	}
}

