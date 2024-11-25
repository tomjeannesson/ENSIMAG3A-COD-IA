document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".navbar-athlete")
    .addEventListener("click", function (event) {
      event.preventDefault() // Prevent default behavior of the <a> tag
      document.querySelectorAll(".content-jump").forEach((element) => {
        element.style.display = "none" // Change CSS property
      })
      document.querySelectorAll(".content-career").forEach((element) => {
        element.style.display = "block" // Change CSS property
      })
    })
})
