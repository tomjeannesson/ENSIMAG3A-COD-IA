function generateGenderPieChartMF(
  containerWidth,
  containerHeight,
  margin,
  data,
  nameCountry,
  id
) {
  console.log(nameCountry)
  // Calculer les dimensions
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom

  // Nettoyer le conteneur avant de générer le pie chart
  d3.select(`#${id}`).selectAll("*").remove()

  // Créer le conteneur SVG
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

  // Groupe principal avec marges
  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)

  // Préparer les données pour le pie chart
  const pieData = [
    { category: "Male", value: data.male },
    { category: "Female", value: data.female },
  ]

  // Définir l'échelle de couleur
  const colorScale = d3
    .scaleOrdinal()
    .domain(["Male", "Female"])
    .range(["#4287f5", "#f54269"]) // Bleu pour hommes, rose pour femmes

  // Générer le pie layout
  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null)

  // Générateur d'arcs
  const arcGenerator = d3
    .arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2 - 20)

  // Calculer le total
  const total = data.male + data.female

  // Créer les arcs
  const arcs = g
    .selectAll(".arc")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "arc")

  // Ajouter les chemins colorés
  arcs
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", (d) => colorScale(d.data.category))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1)
      d3.select(this).style("opacity", 1).style("stroke-width", "3px")
      arcs.filter((p) => p !== d).style("opacity", 0.3) // Dim other segments
    })
    .on("mousemove", function (event, d) {
      tooltip
        .html(
          `
            <div style="text-align: center;">
              <strong>${d.data.category}</strong><br>
              ${d.data.value} athletes<br>
              (${((d.data.value / total) * 100).toFixed(1)}%)
            </div>
            `
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`)
    })
    .on("mouseleave", function (event, d) {
      tooltip.style("opacity", 0)
      d3.select(this).style("opacity", 1).style("stroke-width", "2px")
      arcs.style("opacity", 1)
    })

  // Ajouter les pourcentages
  arcs
    .append("text")
    .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("fill", "white")
    .style("font-weight", "bold")
    .text((d) => `${((d.data.value / total) * 100).toFixed(1)}%`)

  // Titre du pays
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "19px")
    .style("font-weight", "bold")
    .text(nameCountry)

  // Légende
  const legendGroup = svg
    .append("g")
    .attr("transform", `translate(${width - 100}, 20)`)

  const legend = legendGroup
    .selectAll(".legend")
    .data(pieData)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0, ${i * 25})`)

  legend
    .append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d) => colorScale(d.category))

  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text((d) => `${d.category}: ${d.value}`)

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("font-size", "15px")
    .style("opacity", 0)
}
