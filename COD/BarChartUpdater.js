// Fetch JSON and generate charts
fetch("raw_jump_data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json() // Parse the JSON data
  })
  .then((data) => {
    const allEntries = []
    collectEntries(data, allEntries, null, null, null, null) 

    if (allEntries.length > 0) {
      const { topSixTopAir, topSixBottomAir } = processData(allEntries)

      const containerWidth = 300
      const containerHeight = 250
      const margin = { top: 20, right: 30, bottom: 30, left: 40 }

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
      console.error("No valid leaderboard or qualifier entries found.")
    }
  })
  .catch((error) => {
    console.error("Error fetching the JSON file:", error)
  })
