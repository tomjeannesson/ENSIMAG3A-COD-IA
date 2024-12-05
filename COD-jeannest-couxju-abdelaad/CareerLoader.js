// Create a year selector before the chart
const yearSelector = d3
  .select("#careerResults")
  .append("div")
  .style("margin-bottom", "20px")
  .style("text-align", "center")

function createChart(selectedYear, athlete) {
  fetch("careers.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      const selectElement = document.getElementById("selectAthleteCareer")
      const options = []
      if (selectElement.children.length === 0) {
        Object.keys(data)
          .sort((a, b) => a.localeCompare(b))
          .forEach((a) => {
            if (
              data[a].results.filter((r) => r.race.year === "2024").length >
                0 &&
              data[a].results.filter((r) => r.race.year === "2023").length >
                0 &&
              data[a].results.filter((r) => r.race.year === "2022").length > 0
            ) {
              const option = new Option(a, a)
              options.push(a)
              selectElement.add(option)
            }
          })
      }

      athlete = athlete || options[0]
      const results = data[athlete].results
        .filter((r) => r.race.year === selectedYear)
        .sort((a, b) => new Date(a.race.date) - new Date(b.race.date))

      // Chart dimensions
      const width = 1500
      const height = 800
      const marginTop = 60
      const marginRight = 50
      const marginBottom = 200
      const marginLeft = 60

      // Colors
      const lineColor = "#2563eb"
      const dotColor = "#1d4ed8"
      const gridColor = "#e5e7eb"
      const textColor = "#374151"

      // Clear previous chart
      d3.select("#careerResults svg").remove()
      d3.select("body div.tooltip").remove()

      // Define the scales
      const x = d3
        .scalePoint()
        .domain(results.map((d) => d.race.date + " " + d.race.place))
        .range([marginLeft, width - marginRight])
        .padding(0.5)

      const y = d3
        .scaleLinear()
        .domain(d3.extent(results, (d) => d.leaderboard.result).reverse())
        .range([height - marginBottom, marginTop])
        .nice()

      // Create the SVG container
      const svg = d3
        .select("#careerResults")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr(
          "style",
          "width: 100%; height: 100%; font-family: system-ui, sans-serif;"
        )
        .attr("background-color", "#ffffff")

      // Add gridlines
      svg
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-width + marginLeft + marginRight)
        )
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("stroke", gridColor)
            .attr("stroke-dasharray", "2,2")
        )
        .call((g) => g.selectAll(".tick text").remove())

      // Add the x-axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call((g) => g.select(".domain").attr("stroke", gridColor))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .style("fill", textColor)
        .style("font-size", "16px")

      // Add the y-axis
      svg
        .append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(5))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").attr("stroke", gridColor))
        .call((g) =>
          g
            .selectAll(".tick text")
            .style("fill", textColor)
            .style("font-size", "16px")
        )

      // Add Y axis label
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", marginLeft - 40)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("fill", textColor)
        .style("font-size", "18px")
        .text("Result")

      // Add title with selected year
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", marginTop - 30)
        .attr("text-anchor", "middle")
        .style("fill", textColor)
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("margin-bottom", 10)
        .text(`${athlete} - ${selectedYear} Competition Results`)

      // Create a smooth line
      const line = d3
        .line()
        .x((d) => x(d.race.date + " " + d.race.place))
        .y((d) => y(d.leaderboard.result))
        .curve(d3.curveMonotoneX)

      // Add the line with animation
      const path = svg
        .append("path")
        .datum(results)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 2.5)
        .attr("d", line)

      // Add line animation
      const pathLength = path.node().getTotalLength()
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1500)
        .attr("stroke-dashoffset", 0)

      // Create a group for dots and labels
      const dots = svg
        .selectAll(".dot-group")
        .data(results)
        .join("g")
        .attr("class", "dot-group")
        .attr(
          "transform",
          (d) =>
            `translate(${x(d.race.date + " " + d.race.place)},${y(
              d.leaderboard.result
            )})`
        )

      // Add circles with hover effect
      dots
        .append("circle")
        .attr("r", 5)
        .attr("fill", dotColor)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).transition().duration(200).attr("r", 8)

          // Show tooltip
          tooltip
            .style("opacity", 1)
            .html(
              `
              <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <strong>${d.race.place}</strong><br/>
                Date: ${d.race.date}<br/>
                Result: ${d.leaderboard.result}<br/>
                Points: ${d.leaderboard.total_points}
              </div>
            `
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("r", 5)

          tooltip.style("opacity", 0)
        })

      // Add position labels above dots
      dots
        .append("text")
        .text((d) => d.leaderboard.result)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("fill", textColor)
        .style("font-size", "16px")

      // Create a tooltip div
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("pointer-events", "none")
        .style("font-family", "system-ui, sans-serif")
        .style("font-size", "16px")
        .style("color", textColor)
    })
}

// Function to update the chart when year changes
function updateChart(year, athlete) {
  createChart(year, athlete)
}

createChart("2024")
document.getElementById("selectYearCareer").addEventListener("change", (e) => {
  updateChart(
    e.target.value,
    document.getElementById("selectAthleteCareer").value
  )
})

document
  .getElementById("selectAthleteCareer")
  .addEventListener("change", (e) => {
    updateChart(
      document.getElementById("selectYearCareer").value,
      e.target.value
    )
  })
