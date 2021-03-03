//SVG size and padding
const svgWidth = 900;
const svgHeight = 600;
const margin = {
  top: 50,
  right: 50,
  bottom: 90,
  left: 90
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append SVG group to hold chart, and adjust margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append SVG group that will hold our chart, and shift the latter by left and top margins.
var chartData = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// zParameters
var selectXAxis = "poverty";
var selectYAxis = "obesity";

// functions for updating x-scale & y-scale var upon click on axis label
function xScale(censusData, selectXAxis) {
 
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[selectXAxis]) * 0.8,
      d3.max(censusData, d => d[selectXAxis]) * 1.1
    ])
    .range([0, width]);
  return xLinearScale;
}

function yScale(censusData, selectYAxis) {
 
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[selectYAxis]) * 0.9,
      d3.max(censusData, d => d[selectYAxis]) * 1.1
    ])
    .range([height, 0]);
  return yLinearScale;
}

// function for updating xAxis & yAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function for updating circles group with transition to new circles
function xrenderCircles(circlesGroup, newXScale, selectXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[selectXAxis]));
  return circlesGroup;
}

// function for updating text group with transition to new circles upon click on x axis label
function xrenderText(textGroup, newXScale, selectXAxis) {
    
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[selectXAxis]));
  return textGroup;
}

// function for updating circles group with transition to new circles
function yrenderCircles(circlesGroup, newYScale, selectYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[selectYAxis]));
  return circlesGroup;
}

// function for updating text group with transition to new circles upon click on x axis label
function yrenderText(textGroup, newYScale, selectYAxis) {
    
  textGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[selectYAxis]));
  return textGroup;
}

// function for updating circles group with tooltip
function updateToolTip(selectXAxis, selectYAxis, textGroup) {
  var xlabel;
  var ylabel;
  if (selectXAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (selectXAxis === "age") {
    xlabel = "Age:";
  }
  else {
    xlabel = "Household Income:";
  }
  if (selectYAxis === "obesity") {
    ylabel = "Obesity:";
  }
  else if (selectYAxis === "smokes") {
    ylabel = "Smokes:";
  }
  else {
    ylabel = "Lacks Healthcare:";
  }
  var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([80, -60])
  .html(function(d) {
    return (`${d.state}<br>${xlabel} ${d[selectXAxis]}<br>${ylabel} ${d[selectYAxis]}`);
  });
  textGroup.call(toolTip);
  textGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
 
  // on mouseout event
 .on("mouseout", function(data) {
  toolTip.hide(data);
});
return textGroup;
}

// Retrieve data from CSV file 
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;
  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });
  
  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, selectXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, selectYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
  var xAxis = chartData.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
  var yAxis = chartData.append("g")
  .call(leftAxis);

// Create Circles and state text inside circles
  var circlesTextGroup = chartData.selectAll("circle")
  .data(censusData)
  .enter();
  
  var circlesGroup = circlesTextGroup
  .append("circle")
  .attr("cx", d => xLinearScale(d[selectXAxis]))
  .attr("cy", d => yLinearScale(d[selectYAxis]))
  .attr("r", "15")
  .attr("class", "stateCircle");
  
  var textGroup = circlesTextGroup
  .append("text")
  .attr("x", d => xLinearScale(d[selectXAxis]))
  .attr("y", d => yLinearScale(d[selectYAxis]))
  .attr("dy", "3")
  .text(d => d.abbr)
  .attr("class", "stateText");

// Create group for two x-axis labels
  var xlabelsGroup = chartData.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value for event listener
  .classed("active", true)
  .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "age") // value for event listener
  .classed("inactive", true)
  .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") //value for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

// Create group for three y-axis labels
   var ylabelsGroup = chartData.append("g")
   .attr("transform", "rotate(-90)");

   var obeseLabel = ylabelsGroup.append("text")
   .attr("y", 0 - margin.left)
   .attr("x", 0 - (height / 2))
   .attr("dy", "1em")
   .attr("value", "obesity") // value for event listener
   .classed("active", true)
   .text("Obese (%)");
  
   var smokeLabel = ylabelsGroup.append("text")
   .attr("y", 0 - margin.left)
   .attr("x", 0 - (height / 2))
   .attr("dy", "2em")
   .attr("value", "smokes") // value for event listener
   .classed("inactive", true)
   .text("Smokes (%)");
  
  var healthLabel = ylabelsGroup.append("text")
   .attr("y", 0 - margin.left)
   .attr("x", 0 - (height / 2))
   .attr("dy", "3em")
   .attr("value", "healthcare") // value for event listener
   .classed("inactive", true)
   .text("Lacks Healthcare (%)");

// updating ToolTip function 
  var textGroup = updateToolTip(selectXAxis, selectYAxis, textGroup);

// x axis labels event listener
  xlabelsGroup.selectAll("text")
  .on("click", function() {

// get value of selection
  var value = d3.select(this).attr("value");
  if (value !== selectXAxis) {
    // replaces selectXAxis with value
    selectXAxis = value;
    console.log(selectXAxis)

// functions here found above csv import
        // updates x scale for new data
xLinearScale = xScale(censusData, selectXAxis);

// updates x axis with transition
xAxis = renderXAxes(xLinearScale, xAxis);

// updates circles with new x values
circlesGroup = xrenderCircles(circlesGroup, xLinearScale, selectXAxis);
textGroup = xrenderText(textGroup, xLinearScale, selectXAxis)

// updates tooltips with new info
textGroup = updateToolTip(selectXAxis, selectYAxis, textGroup);
if (selectXAxis === "poverty") {
  povertyLabel
    .classed("active", true)
    .classed("inactive", false);
  ageLabel
    .classed("active", false)
    .classed("inactive", true);
  incomeLabel
    .classed("active", false)
    .classed("inactive", true);
}
else if (selectXAxis === "age") {
  ageLabel
    .classed("active", true)
    .classed("inactive", false);
  povertyLabel
    .classed("active", false)
    .classed("inactive", true);
  incomeLabel
    .classed("active", false)
    .classed("inactive", true);
}
else {
  incomeLabel
    .classed("active", true)
    .classed("inactive", false);
  povertyLabel
    .classed("active", false)
    .classed("inactive", true);
  ageLabel
    .classed("active", false)
    .classed("inactive", true);
  }
}
});

// y axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {

    // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== selectYAxis) {

    // replaces selectYAxis with value
    selectYAxis = value;
    console.log(selectYAxis);

    // updates y scale for new data
    yLinearScale = yScale(censusData, selectYAxis);
 
    // updates y axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);
 
    // updates circles and text with new y values
    circlesGroup = yrenderCircles(circlesGroup, yLinearScale, selectYAxis);
    textGroup = yrenderText(textGroup, yLinearScale, selectYAxis);
 
    // updates tooltips with new info
    textGroup = updateToolTip(selectXAxis, selectYAxis, textGroup);
 
    // changes classes to change bold text
    if (selectYAxis === "obesity") {
      obeseLabel
        .classed("active", true)
        .classed("inactive", false);
      smokeLabel
        .classed("active", false)
        .classed("inactive", true);
      healthLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else if (selectYAxis === "smokes") {
      smokeLabel
        .classed("active", true)
        .classed("inactive", false);
      obeseLabel
        .classed("active", false)
        .classed("inactive", true);
      healthLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else {
      healthLabel
        .classed("active", true)
        .classed("inactive", false);
      obeseLabel
        .classed("active", false)
        .classed("inactive", true);
      smokeLabel
        .classed("active", false)
        .classed("inactive", true);
    }
  }
});
}).catch(function(error) {
  console.log(error);
});





