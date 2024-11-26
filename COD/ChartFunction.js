/**
 * Recursively collects entries from the JSON data based on selected filters.
 *
 * @param {Object} node - The current node in the JSON structure.
 * @param {Array} accumulator - The array to accumulate matching entries.
 * @param {string|null} selectedCircuit - The selected circuit filter (e.g., 'WC', 'EC') or null for all.
 * @param {string|null} selectedGender - The selected gender filter ('M' or 'F') or null for all.
 * @param {string|null} selectedYear - The selected year filter (e.g., '2024') or null for all.
 * @param {string|null} selectedRun - The selected run filter ('leaderboard' or 'qualifier') or null for all.
 */
function collectEntries(
  node,
  accumulator,
  selectedCircuit,
  selectedGender,
  selectedYear,
  selectedRun
) {
  if (typeof node !== "object" || node === null) {
    return // Base case: non-object or null node
  }

  // Traverse circuits (e.g., 'WC', 'EC')
  for (const circuitKey in node) {
    if (node.hasOwnProperty(circuitKey)) {
      if (selectedCircuit === null || circuitKey === selectedCircuit) {
        const circuitNode = node[circuitKey]

        // Traverse genders ('M', 'F')
        for (const genderKey in circuitNode) {
          if (circuitNode.hasOwnProperty(genderKey)) {
            if (selectedGender === null || genderKey === selectedGender) {
              const genderNode = circuitNode[genderKey]

              // Traverse years (e.g., '2024')
              for (const yearKey in genderNode) {
                if (genderNode.hasOwnProperty(yearKey)) {
                  if (selectedYear === null || yearKey === selectedYear) {
                    const yearNode = genderNode[yearKey]

                    // Collect 'leaderboard' entries
                    if (
                      (selectedRun === null || selectedRun === "leaderboard") &&
                      Array.isArray(yearNode.leaderboard)
                    ) {
                      accumulator.push(...yearNode.leaderboard)
                    }

                    // Collect 'qualifier' entries
                    if (
                      (selectedRun === null || selectedRun === "qualifier") &&
                      Array.isArray(yearNode.qualifier)
                    ) {
                      accumulator.push(...yearNode.qualifier)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Function to process leaderboard data
function processData(data) {
  const topAirPointsTotal = {}
  const bottomAirPointsTotal = {}
  const topAirCounts = {}
  const bottomAirCounts = {}

  data.forEach((entry) => {
    const {
      top_air_trick,
      top_air_points,
      bottom_air_trick,
      bottom_air_points,
    } = entry

    if (top_air_trick && top_air_points) {
      topAirPointsTotal[top_air_trick] =
        (topAirPointsTotal[top_air_trick] || 0) + top_air_points
      topAirCounts[top_air_trick] = (topAirCounts[top_air_trick] || 0) + 1
    }

    if (bottom_air_trick && bottom_air_points) {
      bottomAirPointsTotal[bottom_air_trick] =
        (bottomAirPointsTotal[bottom_air_trick] || 0) + bottom_air_points
      bottomAirCounts[bottom_air_trick] =
        (bottomAirCounts[bottom_air_trick] || 0) + 1
    }
  })

  // Calculate averages
  const topAirPointsAverage = {}
  Object.entries(topAirPointsTotal).forEach(([trick, totalPoints]) => {
    topAirPointsAverage[trick] = totalPoints / topAirCounts[trick]
  })

  const bottomAirPointsAverage = {}
  Object.entries(bottomAirPointsTotal).forEach(([trick, totalPoints]) => {
    bottomAirPointsAverage[trick] = totalPoints / bottomAirCounts[trick]
  })

  // Transform to arrays
  const topAirPointsArray = Object.entries(topAirPointsAverage).map(
    ([label, value]) => ({ label, value })
  )

  const bottomAirPointsArray = Object.entries(bottomAirPointsAverage).map(
    ([label, value]) => ({ label, value })
  )

  // Sort and get top 6
  return {
    topSixTopAir: topAirPointsArray
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    topSixBottomAir: bottomAirPointsArray
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
  }
}
