document.addEventListener("DOMContentLoaded", function () {
  manageLoading()
});

function manageLoading() {
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get("section"); // Ex: 'jumps', 'athlete'

  // Assurez-vous de supprimer la classe active des autres liens
  document.querySelectorAll(".navbar-links a").forEach(link => {
    if (!link.classList.contains(`navbar-${section}`)) {
      link.classList.remove("active");
    }
  });

  // Activer la section correspondante
  if (section === "jumps") {
    document.querySelectorAll(".content-jump").forEach(element => {
      element.style.display = "block";
    });
    document.querySelectorAll(".content-career").forEach(element => {
      element.style.display = "none";
    });
    document.querySelectorAll(".content-general").forEach(element => {
      element.style.display = "none";
    });

    // Ajouter la classe active à "Jumps"
    document.querySelector(".navbar-jumps").classList.add("active");
  }
  else if (section === "athlete") {
    document.querySelectorAll(".content-career").forEach(element => {
      element.style.display = "block";
    });
    document.querySelectorAll(".content-jump").forEach(element => {
      element.style.display = "none";
    });
    document.querySelectorAll(".content-general").forEach(element => {
      element.style.display = "none";
    });

    // Ajouter la classe active à "Athlete"
    document.querySelector(".navbar-athlete").classList.add("active");
  }
  else if (section == "general") {
    document.querySelectorAll(".content-general").forEach(element => {
      element.style.display = "block";
    });
    document.querySelectorAll(".content-jump").forEach(element => {
      element.style.display = "none";
    });
    document.querySelectorAll(".content-career").forEach(element => {
      element.style.display = "none";
    });

    // Ajouter la classe active à "Athlete"
    document.querySelector(".navbar-general").classList.add("active");
  }
  else {
    document.querySelectorAll(".content-jump").forEach(element => {
      element.style.display = "block";
    });
    document.querySelectorAll(".content-career").forEach(element => {
      element.style.display = "none";
    });
    document.querySelectorAll(".content-general").forEach(element => {
      element.style.display = "none";
    });

    // Ajouter la classe active à "Jumps"
    document.querySelector(".navbar-jumps").classList.add("active");
  }
}

