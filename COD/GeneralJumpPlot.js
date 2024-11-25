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
            // Initialize objects to store total points, min, max, and counts for each jump
            const topAirScores = {};
            const bottomAirScores = {};

            // Iterate over each entry in the leaderboard
            leaderboard.forEach((entry) => {
                const { top_air_trick, top_air_points, bottom_air_trick, bottom_air_points } = entry;

                // Process top air tricks
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

                // Process bottom air tricks
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
            });

            // Calculate the average score for each top and bottom air trick
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

            // Chart dimensions and margins
            const containerWidth = 800;
            const containerHeight = 300;
            const margin = { top: 20, right: 30, bottom: 50, left: 50 };

            // Generate the scatter plot with errors for top air trick
            generateScatterPlotWithErrors(
                containerWidth,
                containerHeight,
                margin,
                sortedTopAirData,
                "topAirScatterPlotContainer"
            );

            // Generate the scatter plot with errors for bottom air trick
            generateScatterPlotWithErrors(
                containerWidth,
                containerHeight,
                margin,
                sortedBottomAirData,
                "bottomAirScatterPlotContainer"
            );
        } else {
            console.error("The 'leaderboard' is not an array or is undefined.");
        }
    })
    .catch((error) => {
        console.error("Error fetching the JSON file:", error);
    });
