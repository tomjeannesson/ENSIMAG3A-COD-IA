from dataclasses import dataclass

import pandas as pd

from .dataframe_metadata import DataframeMetadata


@dataclass
class DataAthlete:
    """Represents one instance of data."""

    metadata: DataframeMetadata
    athlete: str
    raw: float
    rank: int
    max: float


@dataclass
class DataRun:
    """Represents one instance of data."""

    metadata: DataframeMetadata
    min: float
    max: float
    mean: float


class Extractor:
    """Transforms a list of DataFrames into a list of data stats."""

    def __init__(self, dataframe_list: list[pd.DataFrame]) -> None:
        self.dataframes = dataframe_list
        self.stat_labels = [
            "total_points",
        ]
        self.last_extract = None

    def __str__(self) -> str:  # noqa: D105
        if self.last_extract is None:
            return "Empty extractor."
        if self.last_extract[0] == "Athlete":
            string = f"Extract {self.last_extract[0]}: {self.last_extract[1]}\n"
            for key, value in self.last_extract[2].items():
                string += f"{key} raw:  {" ".join([str(round(v.raw, 2)) for v in value])}\n"
                string += f"{key} raw:  {" ".join([str(round(v.raw, 2)) for v in value])}\n"
                string += f"{key} rank: {" ".join([str(round(v.rank, 2)) for v in value])}\n"
                string += f"{key} max:  {" ".join([str(round(v.max, 2)) for v in value])}\n"
            return string
        if self.last_extract[0] == "Run":
            string = f"Extract {self.last_extract[0]}:\n"
            for key, value in self.last_extract[1].items():
                string += f"{key} max:  {" ".join([str(round(v.max, 2)) for v in value])}\n"
                string += f"{key} mean: {" ".join([str(round(v.mean, 2)) for v in value])}\n"
            return string
        error_msg = "Invalid las extract"
        raise ValueError(error_msg)

    def extract_athlete(self, name: str) -> dict[str, list[DataAthlete]]:
        """Transforms a list of DataFrames into a dictionary of a table of data stats according to the athlete axis."""
        stats = {}
        for stat in self.stat_labels:
            list_stat = []
            for dataframe in self.dataframes:
                try:
                    row = dataframe.loc[name]
                except KeyError:
                    continue
                column = dataframe[stat]
                raw = row[stat]
                rank = len(column[column > raw]) + 1
                list_stat.append(
                    DataAthlete(
                        athlete=name,
                        metadata=dataframe.metadata,
                        raw=raw,
                        rank=rank,
                        max=column.max(),
                    )
                )
            stats[stat] = list_stat
        self.last_extract = ("Athlete", name, stats)
        return stats

    def extract_run(self) -> dict[str, list[DataRun]]:
        """Transforms a list of DataFrames into a list of general race stats."""
        stats = {}
        for stat in self.stat_labels:
            list_stat = []
            for dataframe in self.dataframes:
                list_stat = [
                    *list_stat,
                    DataRun(
                        metadata=dataframe.metadata,
                        min=dataframe[stat].min(),
                        max=dataframe[stat].max(),
                        mean=dataframe[stat].mean(),
                    ),
                ]
            stats[stat] = list_stat
        self.last_extract = ("Run", stats)
        return stats
