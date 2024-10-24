import statistics
from dataclasses import dataclass

import pandas as pd
from dataframe_metadata import DataframeMetadata


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
    metadata: DataframeMetadata


class Extractor:
    """Transforms a list of DataFrames into a list of data stats."""

    def __init__(self, dataframe_list: list[pd.DataFrame]) -> None:
        self.dataframes = dataframe_list
        self.stat_labels = ["total_points", "ski_points"]
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

    def extract_athlete_v2(self, name: str) -> dict[str, dict]:
        """Transforms a list of DataFrames into a dictionary of a table of data stats according to the athlete axis."""
        stats = {}

        def create_dico_stat_athlete(list_stat: float, is_raw: int) -> dict[str, float]:
            try:
                quantiles = statistics.quantiles(list_stat, n=4)
                stdev = statistics.stdev(list_stat)
            except statistics.StatisticsError:
                quantiles = [list_stat[0], list_stat[0], list_stat[0]]
                stdev = 0
            return {
                "min": min(list_stat) if is_raw > 0 else max(list_stat),
                "max": max(list_stat) if is_raw > 0 else min(list_stat),
                "mean": sum(list_stat) / len(list_stat),
                "std": stdev,
                "q1": quantiles[0],
                "q2": quantiles[2],
            }

        for stat in self.stat_labels:
            dico_data = {}
            list_stat = []
            list_stat_raw = []
            list_stat_rank = []
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
                list_stat_raw.append(raw)
                list_stat_rank.append(rank)

            dico_data["data"] = list_stat
            dico_data["raw"] = create_dico_stat_athlete(list_stat=list_stat_raw, is_raw=1)
            dico_data["rank"] = create_dico_stat_athlete(list_stat=list_stat_rank, is_raw=0)
            stats[stat] = dico_data
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
