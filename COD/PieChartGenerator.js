// Function to generate a pie chart with hover effects
function generatePieChart(containerWidth, containerHeight, margin, data, id) {
  // Calculate available width and height for the pie chart
  const legendWidth = containerWidth * 0.3; // Allocate 30% of the width for the legend
  const chartWidth = containerWidth - legendWidth - margin * 2;
  const chartHeight = containerHeight - margin * 2;
  const radius = Math.min(chartWidth, chartHeight) / 2;

  // Prepare data for D3.js and sort in descending order
  const dataReady = Object.entries(data)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);

  // Create the SVG container
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .append("g")
    .attr("transform", `translate(${radius + margin},${containerHeight / 2})`);


  const color = (key) => getTrickColor(key);


  // Generate the pie chart
  const pie = d3.pie().value((d) => d.value);
  const data_ready = pie(dataReady);

  // Arc generator
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

  // Create a tooltip div that is hidden by default
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("opacity", 0);

  // Draw the pie chart
  const paths = svg
    .selectAll("path")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", (d) => color(d.data.key))
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1);
      d3.select(this).style("opacity", 1).style("stroke-width", "3px");
      paths.filter(p => p !== d).style("opacity", 0.3); // Dim other segments
    })
    .on("mousemove", function (event, d) {
      const total = d3.sum(dataReady.map((d) => d.value));
      const percent = ((d.data.value / total) * 100).toFixed(2);
      tooltip
        .html(`${d.data.key}: ${percent}%`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 25 + "px");
    })
    .on("mouseleave", function (event, d) {
      tooltip.style("opacity", 0);
      d3.select(this).style("opacity", 0.7).style("stroke-width", "2px");
      paths.style("opacity", 0.7); // Reset opacity of all segments
    });

  // Add the legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${radius + margin * 2},${-radius})`);

  const legendRectSize = 11;
  const legendSpacing = 6;

  legend
    .selectAll("rect")
    .data(dataReady)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * (legendRectSize + legendSpacing))
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", (d) => color(d.key));

  legend
    .selectAll("text")
    .data(dataReady)
    .enter()
    .append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr(
      "y",
      (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2
    )
    .attr("dy", ".35em")
    .attr("class", "pie-legend-text") // Assign class here
    .text((d) => `${d.key}: ${d.value}`);
}


// Function to group infrequent tricks into 'Other'
function createOtherField(dataToProcess, minSize) {
  const processedData = {};
  let otherCount = 0;

  // Group infrequent tricks into 'Other'
  for (const [trick, count] of Object.entries(dataToProcess)) {
    if (count < minSize) {
      otherCount += count;
    } else {
      processedData[trick] = count;
    }
  }

  if (otherCount > 0) {
    processedData["Other"] = otherCount;
  }

  return processedData;
}

// Function to get CSS variable value
function getCssVariableValue(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

// Retrieve values
const widthPie = parseInt(getCssVariableValue("--chart-width"), 10);
const heightPie = parseInt(getCssVariableValue("--chart-height"), 10);
const marginPie = parseInt(getCssVariableValue("--chart-margin"), 10);
