document.addEventListener("DOMContentLoaded", function () {
  manageClickLinks()
  manageLoading()
});


function manageClickLinks() {
  const links = document.querySelectorAll(".navbar-links a");

  links.forEach(link => {
    link.addEventListener("click", function (event) {
      if (this.classList.contains("navbar-report")) {
        links.forEach(l => l.classList.remove("active"));
        this.classList.add("active");
        return;
      }

      event.preventDefault();

      // Supprime la classe active de tous les liens
      links.forEach(l => l.classList.remove("active"));

      // Ajoute la classe active au lien cliqué
      this.classList.add("active");

      // Logique de changement de contenu
      if (this.classList.contains("navbar-athlete")) {
        document.querySelectorAll(".content-jump").forEach((element) => {
          element.style.display = "none";
        });
        document.querySelectorAll(".content-career").forEach((element) => {
          element.style.display = "block";
        });
      } else if (this.classList.contains("navbar-jumps")) {
        document.querySelectorAll(".content-career").forEach((element) => {
          element.style.display = "none";
        });
        document.querySelectorAll(".content-jump").forEach((element) => {
          element.style.display = "block";
        });
      }
    });
  });
}

function manageLoading() {
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get("section"); // Ex: 'jumps', 'athlete'

  // Activer la section correspondante
  if (section === "jumps") {
    document.querySelectorAll(".content-jump").forEach(element => {
      element.style.display = "block";
    });
    document.querySelectorAll(".content-career").forEach(element => {
      element.style.display = "none";
    });

    // Ajouter la classe active à "Jumps"
    document.querySelector(".navbar-jumps").classList.add("active");
  } else if (section === "athlete") {
    document.querySelectorAll(".content-career").forEach(element => {
      element.style.display = "block";
    });
    document.querySelectorAll(".content-jump").forEach(element => {
      element.style.display = "none";
    });

    // Ajouter la classe active à "Athlete"
    document.querySelector(".navbar-athlete").classList.add("active");
  }

  // Assurez-vous de supprimer la classe active des autres liens
  document.querySelectorAll(".navbar-links a").forEach(link => {
    if (!link.classList.contains(`navbar-${section}`)) {
      link.classList.remove("active");
    }
  });
}

