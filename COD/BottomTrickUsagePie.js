
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
      // Count occurrences of 'top_air_trick'
      const bottomAirTrickCounts = {};
      leaderboard.forEach((entry) => {
        const topTrick = entry.bottom_air_trick;
        if (topTrick) {
          bottomAirTrickCounts[topTrick] =
            (bottomAirTrickCounts[topTrick] || 0) + 1;
        }
      });
      const dataBottomJump = createOtherField(bottomAirTrickCounts, 5);

      // Generate the pie chart
      generatePieChart(widthPie, heightPie, marginPie, dataBottomJump, "bottomTricksPie");
    } else {
      console.error("The 'leaderboard' is not an array or is undefined.");
    }
  })
  .catch((error) => {
    console.error("Error fetching the JSON file:", error);
  });
