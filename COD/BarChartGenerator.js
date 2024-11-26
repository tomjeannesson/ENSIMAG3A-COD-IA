// Function to generate a horizontal bar chart with unique colors, rounded corners, legends, and value labels
function generateBarChart(containerWidth, containerHeight, margin, data, id) {
  // Calculate the width and height of the chart area
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  // Sort data in descending order based on value
  const sortedData = data.sort((a, b) => b.value - a.value);

  // Create the SVG container
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define the scales
  const y = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.label))
    .range([0, height])
    .padding(0.2);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(sortedData, (d) => d.value)])
    .nice()
    .range([0, width]);

  // Define the color scale using 'Tableau 10' palette
  const color = (key) => getTrickColor(key);

  // Create a group for each bar and its label
  const barGroup = svg
    .selectAll(".bar-group")
    .data(sortedData)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", (d) => `translate(0,${y(d.label)})`);

  // Add labels to the left of each bar
  barGroup
    .append("text")
    .attr("x", -5) // Position to the left of the bar
    .attr("y", y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text((d) => d.label)
    .attr("class", "bar-legend-text") // Assign class here


  // Create the bars with rounded corners
  barGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", y.bandwidth())
    .attr("width", (d) => x(d.value))
    .attr("fill", (d) => color(d.label))
    .attr("rx", 5) // Set the x-axis radius for rounded corners
    .attr("ry", 5); // Set the y-axis radius for rounded corners

  // Add value labels at the end of each bar
  barGroup
    .append("text")
    .attr("x", (d) => x(d.value) + 5) // Position slightly after the end of the bar
    .attr("y", y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .text((d) => d.value.toFixed(1)) // Round to the nearest tenth
    .attr("class", "bar-legend-text") // Assign class here
}
