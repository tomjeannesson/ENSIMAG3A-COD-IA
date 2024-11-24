// Function to generate a pie chart with a responsive legend
function generatePieChart(containerWidth, containerHeight, margin, data, id) {
  // Calculate available width and height for the pie chart
  const legendWidth = containerWidth * 0.3 // Allocate 30% of the width for the legend
  const chartWidth = containerWidth - legendWidth - margin * 2
  const chartHeight = containerHeight - margin * 2
  const radius = Math.min(chartWidth, chartHeight) / 2

  // Prepare data for D3.js and sort in descending order
  const dataReady = Object.entries(data)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)

  // Create the SVG container
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .append("g")
    .attr("transform", `translate(${radius + margin},${containerHeight / 2})`)

  // Color scale using 'Tableau 10' palette
  const color = d3
    .scaleOrdinal()
    .domain(dataReady.map((d) => d.key))
    .range(d3.schemeTableau10)

  // Generate the pie chart
  const pie = d3.pie().value((d) => d.value)
  const data_ready = pie(dataReady)

  // Arc generator
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius)

  // Draw the pie chart
  svg
    .selectAll("path")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", (d) => color(d.data.key))
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

  // Add the legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${radius + margin * 2},${-radius})`)

  const legendRectSize = 18
  const legendSpacing = 4

  legend
    .selectAll("rect")
    .data(dataReady)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * (legendRectSize + legendSpacing))
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", (d) => color(d.key))

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
    .style("font-size", "12px")
    .text((d) => `${d.key}: ${d.value}`)
}

// Function to group infrequent tricks into 'Other'
function createOtherField(dataToProcess, minSize) {
  const processedData = {}
  let otherCount = 0

  // Group infrequent tricks into 'Other'
  for (const [trick, count] of Object.entries(dataToProcess)) {
    if (count < minSize) {
      otherCount += count
    } else {
      processedData[trick] = count
    }
  }

  if (otherCount > 0) {
    processedData["Other"] = otherCount
  }

  return processedData
}
// Function to get CSS variable value
function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

// Retrieve values
const widthPie = parseInt(getCssVariableValue('--chart-width'), 10);
const heightPie = parseInt(getCssVariableValue('--chart-height'), 10);
const marginPie = parseInt(getCssVariableValue('--chart-margin'), 10);
