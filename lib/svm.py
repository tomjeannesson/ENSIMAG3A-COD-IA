import pandas as pd
from data_source import DataSource

source = DataSource("data.json")
qualifications = source.filter([["WC"], ["M"], [], [], ["Q"]], "include")
dataframe = qualifications[0]

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
for _df in qualifications[1:]:
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
results = dataframe["result"]
dataframe = dataframe.drop("result", axis=1).apply(
    lambda col: (abs(col) - abs(col).min()) / (abs(col).max() - abs(col).min()),
    axis=0,
)
dataframe["result"] = results
