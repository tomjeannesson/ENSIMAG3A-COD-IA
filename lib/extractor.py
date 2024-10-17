from dataclasses import dataclass

import pandas as pd


@dataclass
class DataPoint:
    """Represents one instance of data."""

    raw: float
    rank: int
    max: float


class Extractor:
    """Transforms a list of DataFrames into a list of data stats."""

    def __init__(self, dataframe_list: list[pd.DataFrame]) -> None:
        self.dataframes = dataframe_list
        self.stat_labels = ["total_points"]

    def extract_athlete(self, name: str) -> list[dict[str, DataPoint]]:
        """Transforms a list of DataFrames into a list of data stats according to the athlete axis."""
        res = []
        for dataframe in self.dataframes:
            row = dataframe.loc[name]
            stats = {}
            for stat in self.stat_labels:
                column = dataframe[stat]
                raw = row[stat]
                rank = len(column[column > raw]) + 1
                stats[stat] = DataPoint(
                    raw=raw,
                    rank=rank,
                    max=column.max(),
                )
            res.append(stats)
        return res

    def extract_athlete_v2(self, name: str) -> list[dict[str, DataPoint]]:
        """Transforms a list of DataFrames into a list of data stats according to the athlete axis."""
        stats = {}
        for stat in self.stat_labels:
            for dataframe in self.dataframes:
                list_stat = []
                row = dataframe.loc[name]
                column = dataframe[stat]
                raw = row[stat]
                rank = len(column[column > raw]) + 1
                list_stat.append(
                    DataPoint(
                        raw=raw,
                        rank=rank,
                        max=column.max(),
                    )
                )
            stats[stat] = list_stat

    def extract_run(self) -> None:
        """Transforms a list of DataFrames into a list of general race stats."""
