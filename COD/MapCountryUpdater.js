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
        const countryCodeMatch = name.match(/\((\w{3})\)/)
        const genderMatch = name.match(/\((M|F)\)$/)

        const countryCode = countryCodeMatch ? countryCodeMatch[1] : null // KAZ
        const gender = genderMatch ? genderMatch[1] : null // F

        if (countryCode && gender) {
          if (!acc[countryCode]) {
            acc[countryCode] = { total: 0, male: 0, female: 0 }
          }

          acc[countryCode].total += 1

          if (gender === "M") {
            acc[countryCode].male += 1
          } else if (gender === "F") {
            acc[countryCode].female += 1
          }
        }

        return acc
      }, {})

      const countryData = Object.entries(country_codes).map(
        ([country, data]) => ({
          country: country,
          count: data.total,
          male: data.male,
          female: data.female,
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
      d3.select("#pieChart-mf").selectAll("svg").remove()
      dataMFWorld = getProportionMaleFemaleWorld(countryData)
      generateGenderPieChartMF(
        500,
        500,
        margin,
        dataMFWorld,
        "Worldwide",
        "pieChart-mf"
      )
    })
    .catch((error) => {
      console.error("Error fetching the JSON file:", error)
    })
}
updateGeneralMapCountry()

function getProportionMaleFemaleWorld(data) {
  return Object.values(data).reduce(
    (acc, value) => {
      return {
        male: acc.male + value.male,
        female: acc.female + value.female,
      }
    },
    { male: 0, female: 0 }
  )
}
