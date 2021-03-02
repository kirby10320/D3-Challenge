const svgWidth = 1000;
const svgHeight = 700;
const margin = {
  top: 50,
  right: 30,
  bottom: 50,
  left: 30
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// Append an SVG group that will hold our chart, and shift the latter by left and top margins.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";
// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
      d3.max(censusData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);
  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.9,
      d3.max(censusData, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);
  return yLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function xrenderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}
// function used for updating text group with a transition to new circles upon click on x axis label
function xrenderText(textGroup, newXScale, chosenXAxis) {
    
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
  return textGroup;
}
// function used for updating circles group with a transition to
// new circles
function yrenderCircles(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
// function used for updating text group with a transition to new circles upon click on x axis label
function yrenderText(textGroup, newYScale, chosenYAxis) {
    
  textGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));
  return textGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, textGroup) {
  var xlabel;
  var ylabel;
  if (chosenXAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age:";
  }
  else {
    xlabel = "Household Income:";
  }
  if (chosenYAxis === "obesity") {
    ylabel = "Obesity:";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "Smokes:";
  }
  else {
    ylabel = "Lacks Healthcare:";
  }
  var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([80, -60])
  .html(function(d) {
    return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
  });
  textGroup.call(toolTip);
  textGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
 // onmouseout event
 .on("mouseout", function(data) {
  toolTip.hide(data);
});
return textGroup;
}
// Retrieve data from the CSV file and execute everything below
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
  var xLinearScale = xScale(censusData, chosenXAxis);
// yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);
// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);
// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);
// append y axis
var yAxis = chartGroup.append("g")
  .call(leftAxis);
// Create Circles and state text inside circles
var circlesTextGroup = chartGroup.selectAll("circle")
.data(censusData)
.enter();
var circlesGroup = circlesTextGroup
.append("circle")
.attr("cx", d => xLinearScale(d[chosenXAxis]))
.attr("cy", d => yLinearScale(d[chosenYAxis]))
.attr("r", "15")
.attr("class", "stateCircle");
var textGroup = circlesTextGroup
.append("text")
.attr("x", d => xLinearScale(d[chosenXAxis]))
.attr("y", d => yLinearScale(d[chosenYAxis]))
.attr("dy", "3")
.text(d => d.abbr)
.attr("class", "stateText");
// Create group for two x-axis labels
var xlabelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + 20})`);
var povertyLabel = xlabelsGroup.append("text")
.attr("x", 0)
.attr("y", 20)
.attr("value", "poverty") // value to grab for event listener
.classed("active", true)
.text("In Poverty (%)");
var ageLabel = xlabelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "age") // value to grab for event listener
.classed("inactive", true)
.text("Age (Median)");
var incomeLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") //value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");
// Create group for three y-axis labels
var ylabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)");
var obeseLabel = ylabelsGroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("value", "obesity") // value to grab for event listener
  .classed("active", true)
  .text("Obese (%)");
  var smokeLabel = ylabelsGroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "2em")
  .attr("value", "smokes") // value to grab for event listener
  .classed("inactive", true)
  .text("Smokes (%)");
  
var healthLabel = ylabelsGroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "3em")
  .attr("value", "healthcare") // value to grab for event listener
  .classed("inactive", true)
  .text("Lacks Healthcare (%)");
// updateToolTip function above csv import
var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
// x axis labels event listener
xlabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenXAxis) {
    // replaces chosenXAxis with value
    chosenXAxis = value;
    console.log(chosenXAxis)
// functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);
// updates x axis with transition
xAxis = renderXAxes(xLinearScale, xAxis);
// updates circles with new x values
circlesGroup = xrenderCircles(circlesGroup, xLinearScale, chosenXAxis);
textGroup = xrenderText(textGroup, xLinearScale, chosenXAxis)
// updates tooltips with new info
textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
if (chosenXAxis === "poverty") {
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
else if (chosenXAxis === "age") {
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
  if (value !== chosenYAxis) {
    // replaces chosenYAxis with value
    chosenYAxis = value;
    console.log(chosenYAxis);
    // functions here found above csv import
    // updates y scale for new data
    yLinearScale = yScale(censusData, chosenYAxis);
    // updates y axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);
    // updates circles and text with new y values
    circlesGroup = yrenderCircles(circlesGroup, yLinearScale, chosenYAxis);
    textGroup = yrenderText(textGroup, yLinearScale, chosenYAxis);
    // updates tooltips with new info
    textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
    // changes classes to change bold text
    if (chosenYAxis === "obesity") {
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
    else if (chosenYAxis === "smokes") {
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





