function createErrorChart(selectedYear, athlete) {
  // Clear any existing chart
  d3.select("#careerError").selectAll("svg").remove()

  fetch("careers.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      athlete = athlete || Object.keys(data)[0]
      const chartData = data[athlete].results.filter(
        (item) => item.race.year === selectedYear
      )
      let allRes = []
      for (const res of chartData) {
        allRes = allRes.concat(res.all.filter((r) => r.total_points))
      }
      console.log(allRes)
      const finalData = [
        {
          stat: "total_points",
          min: Math.min(...allRes.map((r) => r.total_points)),
          max: Math.max(...allRes.map((r) => r.total_points)),
          mean:
            allRes
              .map((r) => r.total_points)
              .reduce((partialSum, a) => partialSum + a, 0) / allRes.length,
        },
        {
          stat: "ski_points",
          min: Math.min(...allRes.map((r) => r.ski_points)),
          max: Math.max(...allRes.map((r) => r.ski_points)),
          mean:
            allRes
              .map((r) => r.ski_points)
              .reduce((partialSum, a) => partialSum + a, 0) / allRes.length,
        },
        {
          stat: "time_points",
          min: Math.min(...allRes.map((r) => r.time_points)),
          max: Math.max(...allRes.map((r) => r.time_points)),
          mean:
            allRes
              .map((r) => r.time_points)
              .reduce((partialSum, a) => partialSum + a, 0) / allRes.length,
        },
        {
          stat: "top_air_points",
          min: Math.min(...allRes.map((r) => r.top_air_points)),
          max: Math.max(...allRes.map((r) => r.top_air_points)),
          mean:
            allRes
              .map((r) => r.top_air_points)
              .reduce((partialSum, a) => partialSum + a, 0) / allRes.length,
        },
        {
          stat: "bottom_air_points",
          min: Math.min(...allRes.map((r) => r.bottom_air_points)),
          max: Math.max(...allRes.map((r) => r.bottom_air_points)),
          mean:
            allRes
              .map((r) => r.bottom_air_points)
              .reduce((partialSum, a) => partialSum + a, 0) / allRes.length,
        },
      ]

      generateScatterPlotWithErrorsCareer(
        800,
        500,
        { top: 20, right: 30, bottom: 50, left: 50 },
        finalData,
        "careerError"
      )
    })
    .catch((error) => {
      console.error("Error loading the data:", error)
    })
}

// Example usage
createErrorChart(
  document.getElementById("selectYearCareer").value,
  document.getElementById("selectAthleteCareer").value
)

document.getElementById("selectYearCareer").addEventListener("change", (e) => {
  createErrorChart(
    e.target.value,
    document.getElementById("selectAthleteCareer").value
  )
})

document
  .getElementById("selectAthleteCareer")
  .addEventListener("change", (e) => {
    createErrorChart(
      document.getElementById("selectYearCareer").value,
      e.target.value
    )
  })
