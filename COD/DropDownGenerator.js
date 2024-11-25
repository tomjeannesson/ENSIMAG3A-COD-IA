// Variables to store user selections
let selectedGender = null
let selectedCircuit = null
let selectedYear = null
let selectedRun = null

function extractUniqueKeys(data, depth) {
  if (depth === 0) return Object.keys(data)
  return [
    ...new Set(
      Object.values(data).flatMap((value) =>
        extractUniqueKeys(value, depth - 1)
      )
    ),
  ]
}

// Function to generate independent dropdowns
function generateDropdowns(json) {
  // DOM targets
  const genderSelection = document.getElementById("gender-selection")
  const circuitSelection = document.getElementById("circuit-selection")
  const yearSelection = document.getElementById("year-selection")
  const runSelection = document.getElementById("run-selection")

  // Function to create a dropdown
  function createDropdown(options, id, defaultText, onChangeCallback) {
    const select = document.createElement("select")
    select.id = id

    // Add a default option
    const defaultOption = document.createElement("option")
    defaultOption.textContent = defaultText
    defaultOption.value = ""
    select.appendChild(defaultOption)

    // Add dropdown options
    options.forEach((option) => {
      const opt = document.createElement("option")
      opt.value = option
      opt.textContent = option
      select.appendChild(opt)
    })

    // Add event listener for changes
    select.addEventListener("change", (event) => {
      onChangeCallback(event.target.value)
    })

    return select
  }

  // Extract unique values for each dropdown
  const circuits = extractUniqueKeys(json, 0)
  const genders = extractUniqueKeys(json, 1)
  const years = extractUniqueKeys(json, 2)
  const runs = extractUniqueKeys(json, 3)

  // Create and append dropdowns
  const circuitDropdown = createDropdown(
    circuits,
    "circuit-dropdown",
    "Select Circuit",
    (value) => {
      selectedCircuit = value
    }
  )
  circuitSelection.appendChild(circuitDropdown)

  const genderDropdown = createDropdown(
    genders,
    "gender-dropdown",
    "Select Gender",
    (value) => {
      selectedGender = value
    }
  )
  genderSelection.appendChild(genderDropdown)

  const yearDropdown = createDropdown(
    years,
    "year-dropdown",
    "Select Year",
    (value) => {
      selectedYear = value
    }
  )
  yearSelection.appendChild(yearDropdown)

  const runDropdown = createDropdown(
    runs,
    "run-dropdown",
    "Select Run",
    (value) => {
      selectedRun = value
    }
  )
  runSelection.appendChild(runDropdown)
}

// Fetch the JSON file and generate the dropdowns
fetch("raw_jump_data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json()
  })
  .then((data) => {
    generateDropdowns(data)
  })
  .catch((error) => {
    console.error("Error fetching the JSON file:", error)
  })
