// Fetch JSON and generate charts
function updateBarChart() {
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

      const containerWidth = 380
      const containerHeight = 250
      const margin = { top: 20, right: 30, bottom: 30, left: 40 }

      if (allEntries.length > 0) {
        const { topSixTopAir, topSixBottomAir } = processData(allEntries)

        d3.select("#topBarChart").selectAll("svg").remove()
        d3.select("#bottomBarChart").selectAll("svg").remove()

        generateBarChart(
          containerWidth,
          containerHeight,
          margin,
          topSixTopAir,
          "topBarChart"
        )

        generateBarChart(
          containerWidth,
          containerHeight,
          margin,
          topSixBottomAir,
          "bottomBarChart"
        )
      } else {
        d3.select("#topBarChart").selectAll("svg").remove()
        d3.select("#bottomBarChart").selectAll("svg").remove()
        generateNoDataGraph(containerWidth, containerHeight, "bottomBarChart")
        generateNoDataGraph(containerWidth, containerHeight, "topBarChart")
        console.error("No valid leaderboard or qualifier entries found.")
      }
    })
    .catch((error) => {
      console.error("Error fetching the JSON file:", error)
    })
}

updateBarChart()