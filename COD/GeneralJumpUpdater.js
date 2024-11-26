// Fetch JSON and generate charts
function updateGeneralJumpChart() {
  fetch("raw_jump_data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json() // Parse the JSON data
    })
    .then((data) => {
      const allEntries = []
      collectEntries(
        data,
        allEntries,
        selectedCircuit,
        selectedGender,
        selectedYear,
        selectedRun
      )
      // Chart dimensions and margins
      const containerWidth = 800
      const containerHeight = 500
      const margin = { top: 20, right: 30, bottom: 50, left: 50 }
      
      if (allEntries.length > 0) {
        const { sortedTopAirData, sortedBottomAirData } =
          processData_minmaxmean(allEntries)

        // We clear charts
        d3.select("#topAirScatterPlotContainer").selectAll("svg").remove()
        d3.select("#bottomAirScatterPlotContainer").selectAll("svg").remove()

        // Generate the scatter plot with errors for top air trick
        generateScatterPlotWithErrors(
          containerWidth,
          containerHeight,
          margin,
          sortedTopAirData,
          "topAirScatterPlotContainer"
        )

        // Generate the scatter plot with errors for bottom air trick
        generateScatterPlotWithErrors(
          containerWidth,
          containerHeight,
          margin,
          sortedBottomAirData,
          "bottomAirScatterPlotContainer"
        )
      } else {
        d3.select("#topAirScatterPlotContainer").selectAll("svg").remove()
        d3.select("#bottomAirScatterPlotContainer").selectAll("svg").remove()
        generateNoDataGraph(containerWidth, containerHeight, "bottomAirScatterPlotContainer")
        generateNoDataGraph(containerWidth, containerHeight, "topAirScatterPlotContainer")
      }
    })
    .catch((error) => {
      console.error("Error fetching the JSON file:", error)
    })
}
updateGeneralJumpChart()
