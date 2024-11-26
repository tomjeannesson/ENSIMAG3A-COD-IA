// Load the JSON file
function updatePieChart() {
  fetch("raw_jump_data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json() // Parse the JSON data
    })
    .then((data) => {
      // Collect all leaderboard entries recursively
      const allEntries = []
      collectEntries(
        data,
        allEntries,
        selectedCircuit,
        selectedGender,
        selectedYear,
        selectedRun
      )

      if (allEntries.length > 0) {
        // Count occurrences of 'top_air_trick' and 'bottom_air_trick'
        const bottomAirTrickCounts = {}
        const topAirTrickCounts = {}

        allEntries.forEach((entry) => {
          const bottomTrick = entry.bottom_air_trick
          if (bottomTrick) {
            bottomAirTrickCounts[bottomTrick] =
              (bottomAirTrickCounts[bottomTrick] || 0) + 1
          }
          const topTrick = entry.top_air_trick
          if (topTrick) {
            topAirTrickCounts[topTrick] = (topAirTrickCounts[topTrick] || 0) + 1
          }
        })

        let otherSize = 0.015*allEntries.length
        // Group infrequent tricks into 'Other'
        const dataBottomJump = createOtherField(bottomAirTrickCounts, otherSize)
        const dataTopJump = createOtherField(topAirTrickCounts, otherSize)

        // We clear Pie charts
        d3.select("#topTricksPie").selectAll("svg").remove();
        d3.select("#bottomTricksPie").selectAll("svg").remove();

        // Generate pie charts
        generatePieChart(
          widthPie,
          heightPie,
          marginPie,
          dataTopJump,
          "topTricksPie"
        )
        generatePieChart(
          widthPie,
          heightPie,
          marginPie,
          dataBottomJump,
          "bottomTricksPie"
        )
      } else {
        console.error("No valid leaderboard entries found.")
      }
    })
    .catch((error) => {
      console.error("Error fetching the JSON file:", error)
    })
}

updatePieChart()
