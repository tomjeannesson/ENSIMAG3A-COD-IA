// Fetch JSON and generate charts
function updateGeneralMapCountry() {
  fetch("careers.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json() // Parse the JSON data
    })
    .then((data) => {
      // Chart dimensions and margins
      const containerWidth = 1500
      const containerHeight = 800
      const margin = { top: 20, right: 30, bottom: 50, left: 50 }

      const country_codes = Object.keys(data).reduce((acc, name) => {
        const match = name.match(/\(([^)]+)\)/)
        const countryCode = match ? match[1] : null
        if (countryCode) {
          acc[countryCode] = (acc[countryCode] || 0) + 1
        }
        return acc
      }, {})

      const countryData = Object.entries(country_codes).map(
        ([country, count]) => ({
          country: country,
          count: count,
        })
      )

      console.log(countryData)

      if (countryData.length > 0) {
        // We clear charts
        d3.select("#country-map").selectAll("svg").remove()

        // Generate the scatter plot with errors for top air trick
        generateWorldMap(
          containerWidth,
          containerHeight,
          margin,
          countryData,
          "country-map"
        )
      } else {
        d3.select("#country-map").selectAll("svg").remove()
        generateNoDataGraph(containerWidth, containerHeight, "country-map")
      }
    })
    .catch((error) => {
      console.error("Error fetching the JSON file:", error)
    })
}
updateGeneralMapCountry()
