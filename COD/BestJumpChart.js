// Load the JSON file
fetch("raw_jump_data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Parse the JSON data
  })
  .then((data) => {
    // Access the 'leaderboard' array
    const leaderboard = data?.WC?.M?.["2024"]?.leaderboard;

    if (Array.isArray(leaderboard)) {
      // Initialize objects to store total points and counts for each trick
      const topAirPointsTotal = {};
      const bottomAirPointsTotal = {};
      const topAirCounts = {};
      const bottomAirCounts = {};

      // Iterate over each entry in the leaderboard
      leaderboard.forEach((entry) => {
        const {
          top_air_trick,
          top_air_points,
          bottom_air_trick,
          bottom_air_points,
        } = entry;

        // Process top air tricks
        if (top_air_trick && top_air_points) {
          // Update total points
          topAirPointsTotal[top_air_trick] =
            (topAirPointsTotal[top_air_trick] || 0) + top_air_points;
          // Update count
          topAirCounts[top_air_trick] = (topAirCounts[top_air_trick] || 0) + 1;
        }

        // Process bottom air tricks
        if (bottom_air_trick && bottom_air_points) {
          // Update total points
          bottomAirPointsTotal[bottom_air_trick] =
            (bottomAirPointsTotal[bottom_air_trick] || 0) + bottom_air_points;
          // Update count
          bottomAirCounts[bottom_air_trick] =
            (bottomAirCounts[bottom_air_trick] || 0) + 1;
        }
      });

      // Calculate average points for top air tricks
      const topAirPointsAverage = {};
      Object.entries(topAirPointsTotal).forEach(([trick, totalPoints]) => {
        const count = topAirCounts[trick];
        topAirPointsAverage[trick] = totalPoints / count;
      });

      // Calculate average points for bottom air tricks
      const bottomAirPointsAverage = {};
      Object.entries(bottomAirPointsTotal).forEach(([trick, totalPoints]) => {
        const count = bottomAirCounts[trick];
        bottomAirPointsAverage[trick] = totalPoints / count;
      });

      // Transform averages into arrays of objects
      const topAirPointsArray = Object.entries(topAirPointsAverage).map(
        ([label, value]) => ({ label, value })
      );

      const bottomAirPointsArray = Object.entries(bottomAirPointsAverage).map(
        ([label, value]) => ({ label, value })
      );

      // Sort arrays by average points in descending order and select top 6
      const topSixTopAir = topAirPointsArray
        .sort((a, b) => b.value - a.value)
        .slice(0, 7);

      const topSixBottomAir = bottomAirPointsArray
        .sort((a, b) => b.value - a.value)
        .slice(0, 7);

      // Chart dimensions and margins
      const containerWidth = 300;
      const containerHeight = 250;
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };

      // Generate the bar charts
      generateBarChart(
        containerWidth,
        containerHeight,
        margin,
        topSixTopAir,
        "topBarChart"
      );

      generateBarChart(
        containerWidth,
        containerHeight,
        margin,
        topSixBottomAir,
        "bottomBarChart"
      );
    } else {
      console.error("The 'leaderboard' is not an array or is undefined.");
    }
  })
  .catch((error) => {
    console.error("Error fetching the JSON file:", error);
  });
