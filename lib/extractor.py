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
        self.stat_labels = [
            "total_points",
        ]

    def __str__(self) -> str:  # noqa: D105
        string = f"{self.last_extract[0]}: {self.last_extract[1]}\n"
        for key, value in self.last_extract[2].items():
            string += f"{key} raw:  {" ".join([str(v.raw) for v in value])}\n"
            string += f"{key} rank: {" ".join([str(v.rank) for v in value])}\n"
            string += f"{key} max:  {" ".join([str(v.max) for v in value])}\n"
        return string

    def extract_athlete(self, name: str) -> dict[str, list[DataPoint]]:
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
                    DataPoint(
                        raw=raw,
                        rank=rank,
                        max=column.max(),
                    )
                )
            stats[stat] = list_stat
        self.last_extract = ("Athlete", name, stats)
        return stats

    def extract_run(self) -> None:
        """Transforms a list of DataFrames into a list of general race stats."""
        stats = {}
        for stat in self.stat_labels:
            list_stat = []
            for dataframe in self.dataframes:
                column = dataframe[stat]
                for run_data in dataframe:
                    raw = run_data
                    rank = len(column[column > raw]) + 1
                    list_stat.append(
                        DataPoint(
                            raw=raw,
                            rank=rank,
                            max=column.max(),
                        )
                    )
            stats[stat] = list_stat
        return stats
