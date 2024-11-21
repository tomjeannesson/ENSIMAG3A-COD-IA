import os

import matplotlib.pyplot as plt
import seaborn as sns
from data_source import DataSource
from extractor import Extractor
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

source = DataSource("./../data.json")

dataframe_list = source.filter([["WC"], ["M"], [], [], ["Q"]], "include", None)
extractor = Extractor(dataframe_list)
athletes = extractor.all_athletes()
athletes_data = {}
for athlete in athletes:
    athletes_data[athlete] = extractor.extract_athlete(athlete)


"""
Test with 3 clusters
"""
print("Loading 3 clusters...")  # noqa: T201
df_athletes = extractor.create_dataframe_clustering(
    athletes_data=athletes_data,
    exceptions=[
        "ski_base",
        "ski_deduction_total",
        "total_points",
        "top_air_execution",
        "bottom_air_execution",
        "top_air_points",
        "bottom_air_points",
    ],
)
print("    df_athletes created")  # noqa: T201

"""Create the model of clustering"""
model = KMeans(n_clusters=3, n_init=50)
model.fit(df_athletes)
model.predict(df_athletes)
df_athletes["cluster"] = model.fit_predict(df_athletes)
print("    model created")  # noqa: T201

"""check that the directory exist"""
output_folder = "etude_clusters"
os.makedirs(output_folder, exist_ok=True)  # noqa: PTH103
print("    output_folder created")  # noqa: T201

"""Create the seaborn graph"""
sns.pairplot(df_athletes, hue="cluster", palette="Set1")

# Afficher le plot
plt.suptitle("Pair plot of all variable combinations with k=3 clusters", y=1.02)
plt.savefig(os.path.join(output_folder, "multi_dimensions_cluster_3.png"))  # noqa: PTH118
print("    multi-dim graph created")  # noqa: T201

"""Reduct the model to 2 dimensions with PCA"""
df_athletes_second = df_athletes.drop("cluster", axis=1)

reduct_model = PCA(n_components=2)
athletes_reduced = reduct_model.fit_transform(df_athletes_second)

df_athletes["PCA1"] = athletes_reduced[:, 0]
df_athletes["PCA2"] = athletes_reduced[:, 1]

plt.figure(figsize=(10, 6))
sns.scatterplot(data=df_athletes, x="PCA1", y="PCA2", hue="cluster", palette="Set1", s=100)

plt.title("2D PCA of Athletes Clustering")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
plt.legend(title="Cluster")
plt.savefig(os.path.join(output_folder, "two_dimensions_cluster_3.png"))  # noqa: PTH118
print("    2-dim graph created")  # noqa: T201


"""
Test with 4 clusters
"""
print("\nLoading 4 clusters...")  # noqa: T201
df_athletes_4 = extractor.create_dataframe_clustering(
    athletes_data=athletes_data,
    exceptions=[
        "ski_base",
        "ski_deduction_total",
        "total_points",
        "top_air_execution",
        "bottom_air_execution",
        "top_air_points",
        "bottom_air_points",
    ],
)
print("    df_athletes_4 created")  # noqa: T201

"""Create the model of clustering"""
model = KMeans(n_clusters=4, n_init=50)
model.fit(df_athletes_4)
model.predict(df_athletes_4)
df_athletes_4["cluster"] = model.fit_predict(df_athletes_4)
print("    model_4 created")  # noqa: T201

"""Create the seaborn graph"""
sns.pairplot(df_athletes_4, hue="cluster", palette="Set1")

# Afficher le plot
plt.suptitle("Pair plot of all variable combinations with k=3 clusters", y=1.02)
plt.savefig(os.path.join(output_folder, "multi_dimensions_cluster_4.png"))  # noqa: PTH118
print("    multi-dim-4 graph created")  # noqa: T201

"""Reduct the model to 2 dimensions with PCA"""
df_athletes_second_4 = df_athletes_4.drop("cluster", axis=1)

reduct_model = PCA(n_components=2)
athletes_reduced = reduct_model.fit_transform(df_athletes_second_4)

df_athletes_4["PCA1"] = athletes_reduced[:, 0]
df_athletes_4["PCA2"] = athletes_reduced[:, 1]

plt.figure(figsize=(10, 6))
sns.scatterplot(data=df_athletes_4, x="PCA1", y="PCA2", hue="cluster", palette="Set1", s=100)

plt.title("2D PCA of Athletes Clustering")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
plt.legend(title="Cluster")
plt.savefig(os.path.join(output_folder, "two_dimensions_cluster_4.png"))  # noqa: PTH118
print("    2-dim_4 graph created")  # noqa: T201
