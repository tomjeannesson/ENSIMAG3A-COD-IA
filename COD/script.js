// Dummy data
const data = [10, 20, 15, 25, 30, 20, 40]

// Chart dimensions
const width = 500
const height = 300
const margin = { top: 20, right: 20, bottom: 40, left: 40 }

// Create SVG canvas
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Define scales
const xScale = d3
  .scaleBand()
  .domain(data.map((_, i) => i)) // Create a domain for each data index
  .range([0, width - margin.left - margin.right])
  .padding(0.1)

const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(data)])
  .range([height - margin.top - margin.bottom, 0])

// Add axes
const xAxis = d3.axisBottom(xScale).tickFormat((i) => `Item ${i + 1}`)
const yAxis = d3.axisLeft(yScale)

svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
  .call(xAxis)

svg.append("g").attr("class", "axis").call(yAxis)

// Add bars
svg
  .selectAll(".bar")
  .data(data)
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", (_, i) => xScale(i))
  .attr("y", (d) => yScale(d))
  .attr("width", xScale.bandwidth())
  .attr("height", (d) => height - margin.top - margin.bottom - yScale(d))
