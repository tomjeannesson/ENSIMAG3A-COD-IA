import matplotlib.pyplot as plt
from data_source import DataSource
from pandas import DataFrame

source = DataSource("data.json")


# Fonction pour calculer les moyennes
def calculate_average(data: tuple[dict, list[DataFrame]], num_points: int) -> list[float]:
    """Calculate the average points scored in data.

    Args:
        data (tuple[dict, list[DataFrame]]): The run that should be taken in consideration
        num_points (int): minimum length to avoid index errors

    Returns:
        list[float]: Average points scored by the index + 1 athletes
    """
    sum_points = [0 for _ in range(num_points)]
    for df in data:
        for i, pt in enumerate(df["total_points"][:num_points]):
            sum_points[i] += pt
    return [s / len(data) for s in sum_points]


# Filtrage et calcul des données
qualif = source.filter([["WC"], ["M"], ["2024"], [], ["Q"]], "include")
min_qualif = min(len(df["total_points"]) for df in qualif)
average_point_qualif = calculate_average(qualif, min_qualif)

final = source.filter([["WC"], ["M"], ["2024"], [], ["F1"]], "include")
min_final = min(len(df["total_points"]) for df in final)
average_point_final = calculate_average(final, min_final)

super_final = source.filter([["WC"], ["M"], ["2024"], [], ["F"]], "include")
min_super_final = len(super_final[0]["total_points"])
average_point_super_final = calculate_average(super_final, min_super_final)

# Axes x
x_axis_qualif = list(range(1, min_qualif + 1))
x_axis_final = list(range(1, min_final + 1))
x_axis_super_final = list(range(1, min_super_final + 1))

# Points à mettre en évidence
QUALIF_RANK = 16
FINAL_RANK = 6
SUPER_FINAL_RANK = 3
highlight_qualif = (16, average_point_qualif[15]) if len(average_point_qualif) >= QUALIF_RANK else None
highlight_final = (6, average_point_final[5]) if len(average_point_final) >= FINAL_RANK else None
highlight_super_final = (3, average_point_super_final[2]) if len(average_point_super_final) >= SUPER_FINAL_RANK else None

# Tracé
plt.figure(figsize=(12, 6))

# Tracé des courbes
plt.plot(x_axis_qualif, average_point_qualif, label="Qualification", marker="o", linestyle="-")
plt.plot(x_axis_final, average_point_final, label="Finale", marker="s", linestyle="--")
plt.plot(x_axis_super_final, average_point_super_final, label="Super Finale", marker="^", linestyle="-.")

# Mise en évidence des points
if highlight_qualif:
    plt.scatter(*highlight_qualif, color="red", zorder=5, label="16e Qualif")
    plt.annotate(
        f"{highlight_qualif[1]:.2f}",
        (highlight_qualif[0], highlight_qualif[1]),
        textcoords="offset points",
        xytext=(-15, 10),
        ha="center",
        color="red",
    )
if highlight_final:
    plt.scatter(*highlight_final, color="green", zorder=5, label="6e Finale")
    plt.annotate(
        f"{highlight_final[1]:.2f}",
        (highlight_final[0], highlight_final[1]),
        textcoords="offset points",
        xytext=(-15, 10),
        ha="center",
        color="green",
    )
if highlight_super_final:
    plt.scatter(*highlight_super_final, color="blue", zorder=5, label="3e Super Finale")
    plt.annotate(
        f"{highlight_super_final[1]:.2f}",
        (highlight_super_final[0], highlight_super_final[1]),
        textcoords="offset points",
        xytext=(-15, 10),
        ha="center",
        color="blue",
    )

# Customisation du graphique
plt.title("Performance Moyenne par Étape (2024)", fontsize=14)
plt.xlabel("Classement", fontsize=12)
plt.ylabel("Points Moyens", fontsize=12)
plt.legend(fontsize=10)
plt.grid(visible=True, linestyle="--", alpha=0.7)
plt.tight_layout()

# Affichage
plt.savefig("lib/etude_ranks/plot.png")
