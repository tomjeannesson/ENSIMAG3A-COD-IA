import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from data_source import DataSource

source = DataSource("data.json")

dataframe_list = source.filter([["WC"], [], [], [], []], "include", None)
dataframe = dataframe_list[0]

dataframe = dataframe.drop(
    [
        "top_air_trick",
        "country",
        "bottom_air_trick",
        "first_name",
        "last_name",
        "birth_year",
        "fis_id",
        "bib",
        "tie",
    ],
    axis=1,
)
for _df in dataframe_list[1:]:
    _df = _df.drop(
        [
            "top_air_trick",
            "country",
            "bottom_air_trick",
            "first_name",
            "last_name",
            "birth_year",
            "fis_id",
            "bib",
            "tie",
        ],
        axis=1,
    )
    dataframe = pd.concat([dataframe, _df], axis=0)


dataframe = dataframe.apply(
    lambda col: (abs(col) - abs(col).min()) / (abs(col).max() - abs(col).min()),
    axis=0,
)

corr = dataframe[
    [
        "total_points",
        "time_points",
        "ski_points",
        "ski_deduction_total",
        "top_air_points",
        "bottom_air_points",
    ]
].corr(method="kendall")


mask = np.triu(np.ones_like(corr, dtype=bool))

# Set up the matplotlib figure
f, ax = plt.subplots(figsize=(11, 9))

# Generate a custom diverging colormap
cmap = sns.diverging_palette(230, 20, as_cmap=True)

# Draw the heatmap with the mask and correct aspect ratio
sns.heatmap(
    corr,
    mask=mask,
    cmap=cmap,
    center=0,
    square=True,
    linewidths=0.5,
    cbar_kws={"shrink": 0.5},
)

f.savefig("lib/etude_corrplot/corr.png")


corr = dataframe.corr()

mask = np.triu(np.ones_like(corr, dtype=bool))

# Set up the matplotlib figure
f, ax = plt.subplots(figsize=(11, 9))

# Generate a custom diverging colormap
cmap = sns.diverging_palette(230, 20, as_cmap=True)

# Draw the heatmap with the mask and correct aspect ratio
sns.heatmap(
    corr,
    mask=mask,
    cmap=cmap,
    center=0,
    square=True,
    linewidths=0.5,
    cbar_kws={"shrink": 0.5},
)

f.savefig("lib/etude_corrplot/corr-all.png")
