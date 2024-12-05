function generateScatterPlotWithErrors(
  containerWidth,
  containerHeight,
  margin,
  data,
  id
) {
  // Calculate dimensions
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom

  // Sort data in descending order based on mean value
  const sortedData = data.sort((a, b) => b.mean - a.mean)

  // Create SVG container with a background
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", 800)
    .attr("height", 500)
    .attr("viewbox", [0, 0, width, height])
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Add background rectangle
  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#fff")
    .attr("rx", 8)

  // Define scales with padding
  const x = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.saut))
    .range([0, width])
    .padding(0.4)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(sortedData, (d) => d.max) * 1.1]) // Add 10% padding at the top
    .nice()
    .range([height, 0])

  // Add grid lines
  svg
    .append("g")
    .attr("class", "grid-lines")
    .selectAll("line")
    .data(y.ticks(5))
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#e9ecef")
    .attr("stroke-width", 1)

  // Create a group for each data point
  const scatterGroup = svg
    .selectAll(".scatter-group")
    .data(sortedData)
    .enter()
    .append("g")
    .attr("class", "scatter-group")
    .attr("transform", (d) => `translate(${x(d.saut)}, 0)`)

  // Add error bars with animation
  scatterGroup
    .append("line")
    .attr("class", "error-bar")
    .attr("x1", x.bandwidth() / 2)
    .attr("x2", x.bandwidth() / 2)
    .attr("y1", (d) => y(d.mean))
    .attr("y2", (d) => y(d.mean))
    .attr("stroke", "#6c757d")
    .attr("stroke-width", 2)
    .transition()
    .duration(1000)
    .attr("y1", (d) => y(d.min))
    .attr("y2", (d) => y(d.max))

  // Add horizontal caps to error bars
  const capWidth = 6

  // Top cap
  scatterGroup
    .append("line")
    .attr("class", "error-cap")
    .attr("x1", x.bandwidth() / 2 - capWidth / 2)
    .attr("x2", x.bandwidth() / 2 + capWidth / 2)
    .attr("y1", (d) => y(d.max))
    .attr("y2", (d) => y(d.max))
    .attr("stroke", "#6c757d")
    .attr("stroke-width", 2)

  // Bottom cap
  scatterGroup
    .append("line")
    .attr("class", "error-cap")
    .attr("x1", x.bandwidth() / 2 - capWidth / 2)
    .attr("x2", x.bandwidth() / 2 + capWidth / 2)
    .attr("y1", (d) => y(d.min))
    .attr("y2", (d) => y(d.min))
    .attr("stroke", "#6c757d")
    .attr("stroke-width", 2)

  // Add circles for mean values with animation and hover effect
  scatterGroup
    .append("circle")
    .attr("cx", x.bandwidth() / 2)
    .attr("cy", height)
    .attr("r", 6)
    .attr("fill", "#007bff")
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .transition()
    .duration(1000)
    .attr("cy", (d) => y(d.mean))
    .on("end", function () {
      d3.select(this)
        .on("mouseover", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 8)
            .attr("fill", "#0056b3")
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 6)
            .attr("fill", "#007bff")
        })
    })

  // Add labels for mean values with animation
  scatterGroup
    .append("text")
    .attr("x", x.bandwidth() / 2 + 15)
    .attr("y", (d) => y(d.mean) - 8)
    .attr("text-anchor", "middle")
    .attr("fill", "#495057")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("opacity", 0)
    .text((d) => d.mean.toFixed(1))
    .transition()
    .duration(1000)
    .attr("opacity", 1)

  // Add axes with styling
  // Y-axis
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => d.toFixed(1))
    )
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll(".tick line").attr("stroke", "#adb5bd"))
    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("fill", "#495057")
        .attr("font-size", "14px")
    )

  // X-axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll(".tick line").remove())
    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("fill", "#495057")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
    )

  // Add hover tooltip
  const tooltip = d3
    .select(`#${id}`)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0,0,0,0.8)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("font-size", "12px")

  scatterGroup
    .on("mouseover", function (event, d) {
      tooltip
        .style("visibility", "visible")
        .html(
          `
            <div style="text-align: center; display: flex; flex-direction: column; font-size: 16px;">
                <strong>Saut: ${d.saut}</strong>
                <span>Max: ${d.max.toFixed(1)}</span>
                <span>Moyenne: ${d.mean.toFixed(1)}</span>
                <span>Min: ${d.min.toFixed(1)}</span>
            </div>
            `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden")
    })
}
