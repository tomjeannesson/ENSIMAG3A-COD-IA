// Load the JSON file
fetch("raw_jump_data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json() // Parse the JSON data
  })
  .then((data) => {
    // Access the 'leaderboard' array
    const leaderboard = data?.WC?.M?.["2024"]?.leaderboard

    if (Array.isArray(leaderboard)) {
      // Count occurrences of 'top_air_trick'
      const bottomAirTrickCounts = {}
      const topAirTrickCounts = {}

      leaderboard.forEach((entry) => {
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

      // Group infrequent tricks into 'Other'
      const dataBottomJump = createOtherField(bottomAirTrickCounts, otherSize)
      const dataTopJump = createOtherField(topAirTrickCounts, otherSize)

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
      console.error("The 'leaderboard' is not an array or is undefined.")
    }
  })
  .catch((error) => {
    console.error("Error fetching the JSON file:", error)
  })
