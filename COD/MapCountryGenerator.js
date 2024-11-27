function generateWorldMap(containerWidth, containerHeight, margin, data, id) {
  // Calcul des dimensions
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom

  // Nettoyer le conteneur avant de générer la carte
  d3.select(`#${id}`).selectAll("*").remove()

  // Création du conteneur SVG responsive
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .attr("viewBox", [0, 0, width, height])
    .attr(
      "style",
      "max-width: 100%; height: auto; height: intrinsic; font-family: system-ui, sans-serif;"
    )

  // Définir la projection (Natural Earth)
  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 6.5)
    .translate([width / 2, height / 2])

  const path = d3.geoPath().projection(projection)

  // Préparer les données
  const dataMap = {}
  for (const d of data) {
    dataMap[d.country] = { count: d.count, male: d.male, female: d.female }
  }
  console.log(dataMap)

  // Définir une échelle de couleur en fonction du nombre d'athlètes
  const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([-13, 150])

  // Charger les données GeoJSON personnalisées
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ).then((geojson) => {
    // Dessiner la carte
    svg
      .selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const count = dataMap[d.id]?.count || 0
        return count > 0 ? colorScale(count) : "#7c7c7c"
      })
      .attr("stroke", "#a0a0a0")
      .attr("stroke-width", 0.5)
      .attr("class", "country")
      .on("mouseover", function (event, d) {
        // Highlight the country
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 2)

        svg
          .selectAll("path")
          .filter(function (otherCountry) {
            return otherCountry !== d
          })
          .transition()
          .duration(200)
          .attr("opacity", 0.6)

        const count = dataMap[d.id]?.count || 0

        tooltip
          .style("visibility", "visible")
          .html(
            `
            <div style="text-align: center;">
                <strong>${
                  d.properties.name || d.properties.NAME || "Unknown"
                }</strong><br>
                Participants: ${count}
            </div>
            `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        // Remove highlight
        d3.select(this).attr("stroke", "#a0a0a0").attr("stroke-width", 0.5)

        svg.selectAll("path").transition().duration(200).attr("opacity", 1)

        tooltip.style("visibility", "hidden")
      })
      .on("click", function (event, d) {
        // Récupérer l'élément actuellement sélectionné
        const previouslySelected = svg.select(".selected")

        // Si le pays cliqué est déjà sélectionné, le désélectionner
        if (d3.select(this).classed("selected")) {
          d3.select(this).classed("selected", false)

          d3.select("#pieChart-mf").selectAll("svg").remove()
          dataMFWorld = getProportionMaleFemaleWorld(data)
          generateGenderPieChartMF(
            500,
            500,
            margin,
            dataMFWorld,
            "Worldwide",
            "pieChart-mf"
          )
        } else {
          // Désélectionner le pays précédent (s'il y en avait un)
          previouslySelected.classed("selected", false)

          // Sélectionner le nouveau pays
          svg.selectAll("path").classed("selected", false)

          d3.select(this).classed("selected", true)

          // Afficher les informations dans la console
          d3.select("#pieChart-mf").selectAll("svg").remove()
          if (dataMap[d.id]) {
            generateGenderPieChartMF(
              500,
              500,
              margin,
              dataMap[d.id],
              d.properties.name,
              "pieChart-mf"
            )
          } else {
            generateNoDataGraph(420, 420, "pieChart-mf")
          }
        }
      })

    // Le reste du code de la légende reste le même
    const legendWidth = 200
    const legendHeight = 10

    const legendScale = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth])

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".0f"))

    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - legendWidth - 20}, ${height - 50})`
      )

    // Gradient de couleur pour la légende
    const defs = svg.append("defs")

    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")

    linearGradient
      .selectAll("stop")
      .data(
        colorScale.ticks().map((t, i, n) => ({
          offset: `${(100 * i) / n.length}%`,
          color: colorScale(t),
        }))
      )
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color)

    // Rectangle de légende avec gradient
    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")

    // Axe de la légende
    legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .call((g) => g.selectAll(".domain").remove())
      .call((g) =>
        g.selectAll("text").attr("font-size", "10px").attr("fill", "#333")
      )

    // Libellé de la légende
    legendGroup
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Number of athletes by country")
  })

  // Ajouter un tooltip
  const tooltip = d3
    .select(`#${id}`)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(255,255,255,0.9)")
    .style("color", "#333")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)")
    .style("border", "1px solid #ddd")
    .style("font-size", "16px")
}
