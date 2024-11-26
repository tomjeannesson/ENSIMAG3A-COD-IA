// Function to recursively collect entries based on selected filters
function collectEntries(
  node,
  accumulator,
  selectedGender,
  selectedCircuit,
  selectedYear,
  selectedRun
) {
  if (typeof node !== "object" || node === null) {
    return // Base case: non-object or null node
  }

  // Check if the current node matches the selected filters
  const matchesFilters = (key, selectedValue) =>
    selectedValue === null || key === selectedValue

  // Traverse the keys in the current node
  for (const key in node) {
    if (node.hasOwnProperty(key)) {
      const child = node[key]

      // Apply filtering logic based on the current key
      if (
        key === "leaderboard" &&
        Array.isArray(child) &&
        matchesFilters(key, selectedRun)
      ) {
        accumulator.push(...child)
      } else if (
        key === "qualifier" &&
        Array.isArray(child) &&
        matchesFilters(key, selectedRun)
      ) {
        accumulator.push(...child)
      } else if (
        matchesFilters(key, selectedGender) ||
        matchesFilters(key, selectedCircuit) ||
        matchesFilters(key, selectedYear) ||
        matchesFilters(key, selectedRun)
      ) {
        collectEntries(
          child,
          accumulator,
          selectedGender,
          selectedCircuit,
          selectedYear,
          selectedRun
        )
      }
    }
  }
}

fetch("raw_jump_data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json()
  })
  .then((data) => {
    const accumulator = []
    collectEntries(
      data,
      accumulator,
      selectedGender,
      selectedCircuit,
      selectedYear,
      selectedRun
    )
    console.log("Filtered Entries:", accumulator)
  })
  .catch((error) => {
    console.error("Error fetching the JSON file:", error)
  })

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

function processData_minmaxmean(data) {
  const topAirScores = {};
  const bottomAirScores = {};

  data.forEach((entry) => {
    const { top_air_trick, top_air_points, bottom_air_trick, bottom_air_points } = entry;

    if (top_air_trick && top_air_points) {
      if (!topAirScores[top_air_trick]) {
        topAirScores[top_air_trick] = { min: top_air_points, max: top_air_points, total: top_air_points, count: 1 };
      } else {
        topAirScores[top_air_trick].min = Math.min(topAirScores[top_air_trick].min, top_air_points);
        topAirScores[top_air_trick].max = Math.max(topAirScores[top_air_trick].max, top_air_points);
        topAirScores[top_air_trick].total += top_air_points;
        topAirScores[top_air_trick].count += 1;
      }
    }

    if (bottom_air_trick && bottom_air_points) {
      if (!bottomAirScores[bottom_air_trick]) {
        bottomAirScores[bottom_air_trick] = { min: bottom_air_points, max: bottom_air_points, total: bottom_air_points, count: 1 };
      } else {
        bottomAirScores[bottom_air_trick].min = Math.min(bottomAirScores[bottom_air_trick].min, bottom_air_points);
        bottomAirScores[bottom_air_trick].max = Math.max(bottomAirScores[bottom_air_trick].max, bottom_air_points);
        bottomAirScores[bottom_air_trick].total += bottom_air_points;
        bottomAirScores[bottom_air_trick].count += 1;
      }
    }
  })

  const topAirData = Object.entries(topAirScores).map(([trick, { min, max, total, count }]) => ({
    saut: trick,
    min: min,
    max: max,
    mean: total / count // Calculate the mean score
  }));

  const bottomAirData = Object.entries(bottomAirScores).map(([trick, { min, max, total, count }]) => ({
    saut: trick,
    min: min,
    max: max,
    mean: total / count // Calculate the mean score
  }));

  // Sort the data by mean score in descending order
  const sortedTopAirData = topAirData.sort((a, b) => b.mean - a.mean);
  const sortedBottomAirData = bottomAirData.sort((a, b) => b.mean - a.mean);

  return {
    sortedTopAirData, sortedBottomAirData
  }
}
