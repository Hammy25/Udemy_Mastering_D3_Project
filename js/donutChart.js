/*
Code for Donut Chart
*/

// Defining donut-chart class
class DonutChart{

	// Constructor
	constructor(_parentElement){
		this.parentElement = _parentElement;

		this.initializeChart();
	}

	// Initialize chart
	initializeChart(){
		var vis = this;

		// Define constants
		vis.margin = {top: 20, right: 0, bottom: 20, left: 40};
		vis.height = 130;
		vis.width = 300;
		vis.radius = Math.min(vis.width, vis.height)/2;

		 // Transitions
    	vis.t = () => { return d3.transition().ease(d3.easeLinear).duration(1000); }

		// Select area and append chart
		vis.svg = d3.select(vis.parentElement).append("svg")
						 .attr("preserveAspectRatio", "xMinYMin meet")
                         .attr("viewBox", "0 0 340 170")
                         .classed(".svg-content", true);

		vis.donut = vis.svg.append("g")
						 .attr("height", vis.height)
						 .attr("width", vis.width)
						 .attr("id", "donut")
		    			 .attr("transform", "translate(" + (vis.width + vis.margin.left + vis.margin.right) / 2 + "," + (vis.height + vis.margin.top + vis.margin.bottom)/ 2 + ")");

		// Define arcs
		vis.arc = d3.arc()
					.outerRadius(vis.radius)
					.innerRadius(Math.min(vis.width, vis.height)/2 - Math.min(vis.width, vis.height)/4);

		// Pie layout initialization
		vis.pie = d3.pie()
		            .sort(null)
		            .value( d => d.count);

		//Color scale
		vis.pieScale = d3.scaleOrdinal(d3.schemeBlues[3]);
		vis.wrangleData();

	    // Title
	    vis.svg.append("text")
	       .attr("class", "title")
	       .attr("x", vis.margin.left)
	       .attr("y", vis.margin.top / 2)
	       .attr("text-anchor","center")
	       .attr("font-size", 14)
	       .text("Company Size Distribution");
	}

	// Wrangle Data
	wrangleData(values){
		var vis = this;

	    if(values != undefined){
  			calls = allCalls.filter(function(d){
      		return ((d.date > values[0]) && (d.date < values[1]))
  		})
		}else{
  			calls = allCalls;
		}

		console.log(calls.length);

		vis.smallCount = 0;
		vis.mediumCount = 0;
		vis.largeCount = 0;
		
		calls.forEach( item => {
			if(item.company_size === "small"){
	      		vis.smallCount += 1;
	    	}else if(item.company_size === "medium"){
	      		vis.mediumCount += 1;
	    	}else{
	      		vis.largeCount += 1;
	    	}
    	});

		vis.pieData = [
		  {size: "large", count: vis.largeCount},
		  {size: "medium", count: vis.mediumCount},
		  {size: "small", count: vis.smallCount}
		  ];
		
		vis.updateChart();
	}

	// Update chart
	updateChart(){
		var vis = this;

		// Domain of ordinal scale
		vis.pieScale.domain(sizesArray);

		vis.donut.selectAll(".arc").remove();

		vis.pieChart = vis.donut.selectAll(".arc")
	                       .data(vis.pie(vis.pieData))
	                       .enter().append("g")
	                       .attr("class", "arc");


		vis.pieChart.append("path")
		        .attr("fill", d => vis.pieScale(d.data.count))
		        .attr("fill-opacity", 0.2)
	        	.transition(vis.t())
	        	.attr("fill-opacity", 0.7)
	        	.attr("d", vis.arc);

	    // Pie chart legend
	    vis.pieLegend = d3.select("#donut").selectAll(".pieLegends")
	            .data(sizesArray)
	            .enter().append("g")
	            .attr("class", "pieLegends")
	            .attr("transform", (d, i) => "translate(75," + i * 20 + ")");
	        
	    vis.pieLegend.append("rect")
	           .attr("x", 0)
	           .attr("y", 0)
	           .attr("width", 10)
	           .attr("height", 10)
	           .attr("stroke", "black")
	           .style("fill", d => vis.pieScale(d));
	        
	    vis.pieLegend.append("text")
	           .attr("x", 20)
	           .attr("y", 10)
	           .text((d) => d)
	           .attr("class", "textselected")
	           .style("text-anchor", "start")
	           .style("font-size", 14);


	}
}



