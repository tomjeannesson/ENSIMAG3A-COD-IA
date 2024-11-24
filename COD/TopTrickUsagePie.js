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
      const topAirTrickCounts = {};
      leaderboard.forEach((entry) => {
        const topTrick = entry.top_air_trick;
        if (topTrick) {
          topAirTrickCounts[topTrick] =
            (topAirTrickCounts[topTrick] || 0) + 1;
        }
      });

      // Group infrequent tricks into 'Other'
      const dataTopJump = createOtherField(topAirTrickCounts, 5);

      // Generate the pie chart
      generatePieChart(widthPie, heightPie, marginPie, dataTopJump, "topTricksPie");
    } else {
      console.error("The 'leaderboard' is not an array or is undefined.");
    }
  })
  .catch((error) => {
    console.error("Error fetching the JSON file:", error);
  });
