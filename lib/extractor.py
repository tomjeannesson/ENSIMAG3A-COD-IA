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
    compare_to_rank: dict
    compare_to_athlete: dict
    compare_to_interval: dict


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
            "result",
            "time",
            "time_points",
            "top_air_judge1",
            "top_air_judge2",
            "top_air_coefficient",
            "top_air_execution",
            "top_air_points",
            "bottom_air_judge1",
            "bottom_air_judge2",
            "bottom_air_coefficient",
            "bottom_air_execution",
            "bottom_air_points",
            "air_points",
            "ski_judge1",
            "ski_judge2",
            "ski_judge3",
            "ski_judge4",
            "ski_judge5",
            "ski_deduction_judge1",
            "ski_deduction_judge2",
            "ski_deduction_judge3",
            "ski_deduction_judge4",
            "ski_deduction_judge5",
            "ski_base",
            "ski_deduction_total",
            "ski_points",
            "total_points",
        ]
        self.last_extract = None

    def __str__(self) -> str:  # noqa: D105
        if self.last_extract is None:
            return "Empty extractor."
        if self.last_extract[0] == "Athlete":
            string = f"Extract {self.last_extract[0]}: {self.last_extract[1]}\n"
            for key, value in self.last_extract[2].items():
                string += f"{key} raw:  {" ".join([str(round(v.raw, 2)) for v in value["data"]])}\n"
                string += f"{key} raw:  {" ".join([str(round(v.raw, 2)) for v in value["data"]])}\n"
                string += f"{key} rank: {" ".join([str(round(v.rank, 2)) for v in value["data"]])}\n"
                string += f"{key} max:  {" ".join([str(round(v.max, 2)) for v in value["data"]])}\n"
            return string
        if self.last_extract[0] == "Run":
            string = f"Extract {self.last_extract[0]}:\n"
            for key, value in self.last_extract[1].items():
                string += f"{key} max:  {" ".join([str(round(v.max, 2)) for v in value])}\n"
                string += f"{key} mean: {" ".join([str(round(v.mean, 2)) for v in value])}\n"
            return string
        error_msg = "Invalid las extract"
        raise ValueError(error_msg)

    def all_athletes(self) -> set:
        """Return a set containing all athlete's name from the dataframe."""
        athletes_name = set()
        for dataframe in self.dataframes:
            for name in dataframe.index:
                athletes_name.add(name)
        return athletes_name

    # def extract_athlete_simple(
    #     self,
    #     name: str,
    # ) -> dict[str, dict]:
    #     """Transforms a list of Dataframes into a dictionary of data"""
    #     res = {} # noqa: ERA001
    #     for dataframe in self.dataframes:
    #         for index, row in dataframe.iterrows():

    def extract_athlete(
        self,
        name: str,
        compare_to_rank: int = 1,
        compare_to_athlete: str | None = None,
        compare_to_interval: tuple[int] = (1, 6),
    ) -> dict[str, dict]:
        """Transforms a list of DataFrames into a dictionary of dictionary of data stats according to the athlete axis.

        Example data returned:
        'air_points':
                {'data': [DataAthlete(metadata=<races.utils.data_processing.dataframe_metadata.DataframeMetadata object at 0xffff90267650>,
                                    athlete='MOUILLE Thibaud',
                                    raw=np.float64(12.23),
                                    rank=1,
                                    max=np.float64(12.23),
                                    compare_to_rank={'rank': 1,
                                                    'raw': np.float64(12.23),
                                                    'value': 1},
                                    compare_to_athlete={'rank': None,
                                                        'raw': None,
                                                        'value': None},
                                    compare_to_interval={'raw': np.float64(9.364),
                                                        'value': (1, 6)})],
                'rank': {'max': 1,
                        'mean': 1.0,
                        'min': 1,
                        'q1': 1,
                        'q2': 1,
                        'std': 0},
                'raw': {'max': np.float64(12.23),
                        'mean': np.float64(12.23),
                        'min': np.float64(12.23),
                        'q1': np.float64(12.23),
                        'q2': np.float64(12.23),
                        'std': 0}}
        """
        stats = {}

        def create_dico_stat_athlete(list_stat: float, is_raw: int = 1) -> dict[str, float]:
            """Function that create a dictionary of statistics from a table of float values.

            is_raw is used to specify if it's for rank of raw (because min/max are different in that case).
            """
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
                rank = len(column[column < raw]) + 1 if stat in ("result", "time") else len(column[column > raw]) + 1
                rank_compare_value = column.iloc[compare_to_rank - 1]
                athlete_compare_value = None
                rank_compare_athlete = None
                interval_compare_value = column.iloc[compare_to_interval[0] - 1 : compare_to_interval[1] - 1].mean()
                if compare_to_athlete is not None:
                    athlete_compare_value = column.loc[compare_to_athlete]
                    rank_compare_athlete = len(column[column > athlete_compare_value]) + 1
                list_stat.append(
                    DataAthlete(
                        athlete=name,
                        metadata=dataframe.metadata,
                        raw=raw,
                        rank=rank,
                        max=column.max(),
                        compare_to_rank={
                            "value": compare_to_rank,
                            "raw": rank_compare_value,
                            "rank": compare_to_rank,
                        },
                        compare_to_athlete={
                            "value": compare_to_athlete,
                            "raw": athlete_compare_value,
                            "rank": rank_compare_athlete,
                        },
                        compare_to_interval={"value": compare_to_interval, "raw": interval_compare_value},
                    )
                )
                list_stat_raw.append(raw)
                list_stat_rank.append(rank)

            dico_data["data"] = list_stat
            list_stat_raw = [float(elem) for elem in list_stat_raw if elem is not None]
            list_stat_rank = [float(elem) for elem in list_stat_rank if elem is not None]
            if len(list_stat_raw) > 0:
                dico_data["raw"] = create_dico_stat_athlete(list_stat=list_stat_raw, is_raw=1)
            if len(list_stat_rank) > 0:
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

    def create_dataframe_clustering(self, athletes_data: dict, exceptions: list | None = None) -> pd.DataFrame:
        """Create a normalize dataframe with athletes data."""
        filtered_labels = [label for label in self.stat_labels if label not in exceptions]

        data = [[attributes[label]["raw"]["mean"] for label in filtered_labels] for athlete, attributes in athletes_data.items()]
        athlete_names = list(athletes_data.keys())

        df_athletes = pd.DataFrame(data, columns=filtered_labels, index=athlete_names)

        return df_athletes.apply(lambda col: (abs(col) - abs(col).min()) / (abs(col).max() - abs(col).min()), axis=0)
