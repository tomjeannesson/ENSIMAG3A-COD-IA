const width = 600
const height = 555
const margin = 50

function createSpiderChart(selectedYear, athlete) {
  // Clear any existing chart
  d3.select("#careerSpider").selectAll("svg").remove()

  fetch("careers.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      // Filter data for selected year and athlete
      athlete = athlete || Object.keys(data)[0]
      const filteredData = data[athlete].results
        .filter((item) => item.race.year === selectedYear)
        .sort(
          (a, b) =>
            Math.max(...(b.all?.map((r) => r.total_points) || [])) -
            Math.max(...(a.all?.map((r) => r.total_points) || []))
        )
        .filter((_, idx) => idx < 5)

      // Prepare data for spider chart
      const chartData = [
        filteredData.reduce((acc, item) => {
          const dataSource = item.all?.sort(
            (a, b) => b.total_points - a.total_points
          )[0]
          if (dataSource === undefined) {
            return acc
          }
          // Initialize accumulator on first iteration
          if (!acc.count) {
            acc = {
              total_points: 0,
              ski_points: 0,
              top_air_points: 0,
              bottom_air_points: 0,
              time_points: 0,
              count: 0,
              races: [], // Store race information
            }
          }

          // Add current values
          acc.total_points += dataSource.total_points
          acc.ski_points += dataSource.ski_points
          acc.top_air_points += dataSource.top_air_points
          acc.bottom_air_points += dataSource.bottom_air_points
          acc.time_points += dataSource.time_points
          acc.count++

          // Store race information
          acc.races.push({
            raceName: item.race.name,
            location: item.race.location,
          })

          return acc
        }, {}),
      ].map((avgData) => ({
        total_points: avgData.total_points / avgData.count,
        ski_points: avgData.ski_points / avgData.count,
        top_air_points: avgData.top_air_points / avgData.count,
        bottom_air_points: avgData.bottom_air_points / avgData.count,
        time_points: avgData.time_points / avgData.count,
        races: avgData.races,
      }))

      // If no data, return early
      if (chartData.length === 0) return

      // Prepare SVG
      const svg = d3
        .select("#careerSpider")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr(
          "style",
          "max-width: 100%; height: auto; height: intrinsic; font-family: system-ui, sans-serif;"
        )

      // Define the axes
      const axes = [
        "total_points",
        "ski_points",
        "top_air_points",
        "bottom_air_points",
        "time_points",
      ]

      // Find max values for each axis to scale the chart
      const maxValues = {
        total_points: 88.49,
        ski_points: 55.2,
        top_air_points: 9.72,
        bottom_air_points: 9.64,
        time_points: 20,
      }

      // Create scales
      const scales = {}
      axes.forEach((axis) => {
        scales[axis] = d3
          .scaleLinear()
          .domain([0, maxValues[axis]])
          .range([0, Math.min(width, height) / 2 - margin])
      })

      // Calculate coordinates
      const angleSlice = (Math.PI * 2) / axes.length

      // Background grid
      const backgroundGrid = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)

      // Draw circular grid lines
      ;[0.25, 0.5, 0.75, 1].forEach((level) => {
        backgroundGrid
          .append("circle")
          .attr(
            "r",
            scales["total_points"](
              Math.max(...Object.values(maxValues)) * level
            )
          )
          .attr("fill", "none")
          .attr("stroke", "#e0e0e0")
          .attr("stroke-width", 1)
      })

      // Draw axis lines
      axes.forEach((axis, i) => {
        const angle = i * angleSlice - Math.PI / 2
        backgroundGrid
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", scales[axis](maxValues[axis]) * Math.cos(angle))
          .attr("y2", scales[axis](maxValues[axis]) * Math.sin(angle))
          .attr("stroke", "#e0e0e0")
          .attr("stroke-width", 1)

        // Axis labels
        backgroundGrid
          .append("text")
          .attr("x", scales[axis](maxValues[axis] * 1.1) * Math.cos(angle))
          .attr("y", scales[axis](maxValues[axis] * 1.1) * Math.sin(angle))
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text(axis)
          .attr("font-size", "12px")
          .attr("fill", "#666")
      })

      // Draw data polygon
      chartData.forEach((dataPoint, index) => {
        const polygonData = axes.map((axis, i) => {
          const angle = i * angleSlice - Math.PI / 2
          const value = dataPoint[axis] || 0
          return [
            scales[axis](value) * Math.cos(angle),
            scales[axis](value) * Math.sin(angle),
          ]
        })

        // Create a group for each polygon to handle hover effects
        const polygonGroup = backgroundGrid
          .append("g")
          .attr("class", "polygon-group")

        // Add polygon
        const polygon = polygonGroup
          .append("polygon")
          .attr("points", polygonData.map((d) => d.join(",")).join(" "))
          .attr("fill", d3.schemeCategory10[index % 10])
          .attr("fill-opacity", 0.3)
          .attr("stroke", d3.schemeCategory10[index % 10])
          .attr("stroke-width", 2)

        // Prepare tooltip content
        const tooltipContent = `
          Total Points: ${dataPoint.total_points.toFixed(2)}
          Ski Points: ${dataPoint.ski_points.toFixed(2)}
          Top Air Points: ${dataPoint.top_air_points.toFixed(2)}
          Bottom Air Points: ${dataPoint.bottom_air_points.toFixed(2)}
          Time Points: ${dataPoint.time_points.toFixed(2)}
        `

        // Add title (tooltip) to the polygon
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("opacity", 0)
          .style("pointer-events", "none")
          .style("font-family", "system-ui, sans-serif")
          .style("font-size", "16px")
          .style("color", "black")

        // Add hover effects
        polygonGroup
          .on("mouseover", function (event, d) {
            d3.select(this)
              .select("polygon")
              .attr("fill-opacity", 0.6)
              .attr("stroke-width", 4)
            tooltip
              .style("opacity", 1)
              .html(
                `
                <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <strong>Total Points: ${chartData[0].total_points.toFixed(
                    2
                  )}</strong><br/>
                  Ski Points: ${chartData[0].ski_points.toFixed(2)}<br/>
                  Top Air Points: ${chartData[0].top_air_points.toFixed(2)}<br/>
                  Bottom Air Points: ${chartData[0].bottom_air_points.toFixed(
                    2
                  )}<br/>
                  Time Points: ${chartData[0].time_points.toFixed(2)}<br/>
                </div>
              `
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px")
          })
          .on("mouseout", function () {
            d3.select(this)
              .select("polygon")
              .attr("fill-opacity", 0.3)
              .attr("stroke-width", 2)
            tooltip.style("opacity", 0)
          })
      })
    })
    .catch((error) => {
      console.error("Error loading the data:", error)
    })
}

// Example usage
createSpiderChart(
  document.getElementById("selectYearCareer").value,
  document.getElementById("selectAthleteCareer").value
)

document.getElementById("selectYearCareer").addEventListener("change", (e) => {
  createSpiderChart(
    e.target.value,
    document.getElementById("selectAthleteCareer").value
  )
})

document
  .getElementById("selectAthleteCareer")
  .addEventListener("change", (e) => {
    createSpiderChart(
      document.getElementById("selectYearCareer").value,
      e.target.value
    )
  })
