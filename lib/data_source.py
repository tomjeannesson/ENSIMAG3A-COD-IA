import json
from collections.abc import Callable
from pathlib import Path

import pandas as pd
from dataframe_metadata import DataframeMetadata


class DataSource:
    """Used to extract data from a json file."""

    def __init__(self, path: str) -> None:
        self.path = path
        with Path(path).open() as f:
            self.raw_data = json.load(f)
        self.reload_data()

    def reload_data(self) -> None:
        """Extracts all the data contained in the `raw_data` attribute, and transforms the innermost values to pandas Dataframes."""
        current_data = self.raw_data
        new_data = {}
        data_list = []
        for circuit in current_data:
            new_data[circuit] = {}
            for gender in current_data[circuit]:
                new_data[circuit][gender] = {}
                for year in current_data[circuit][gender]:
                    new_data[circuit][gender][year] = {}
                    for place in current_data[circuit][gender][year]:
                        new_data[circuit][gender][year][place] = {}
                        for run in current_data[circuit][gender][year][place]:
                            dataframe = pd.DataFrame(data=json.loads(current_data[circuit][gender][year][place][run]))
                            dataframe.metadata = DataframeMetadata(
                                circuit=circuit,
                                gender=gender,
                                year=year,
                                place=place,
                                run=run,
                            )
                            new_data[circuit][gender][year][place][run] = dataframe
                            data_list.append(dataframe)

        self.data_tree: dict[str, dict[str, dict[str, dict[str, dict[str, pd.DataFrame]]]]] = new_data
        self.data: list[pd.DataFrame] = data_list

    def filter(
        self,
        filters: list | None = None,
        filter_mode: str = "exclude",
        filter_callback: Callable | None = None,
    ) -> tuple[dict, list[pd.DataFrame]]:
        """Selects all datasets that correspond to the specified filters, and applies the filter_callback to have an extra layer of filtering."""
        expected_filter_length = 5

        def default_filter(dataframe: pd.DataFrame) -> bool:
            if filter_mode == "include":
                for index, filter_list in enumerate(filters):
                    if len(filter_list) == 0 or dataframe.metadata.to_list()[index] in filter_list:
                        continue
                    return False
            if filter_mode == "exclude":
                for index, filter_list in enumerate(filters):
                    if len(filter_list) == 0 or dataframe.metadata.to_list()[index] not in filter_list:
                        continue
                    return False
            return True

        if len(filters) != expected_filter_length:
            error_msg = f"Filters shape should be of length {expected_filter_length}."
            raise ValueError(error_msg)

        if filter_mode not in ["exclude", "include"]:
            error_msg = f"Filter mode {filter_mode} not supported. Supported filter modes are exclude and include."
            raise ValueError(error_msg)

        filter_callback = filter_callback or (lambda _: True)
        if filter_callback is None:
            error_msg = "No filters and filter_callback function were provided."
            raise ValueError(error_msg)

        return [
            dataframe
            for dataframe in [
                dataframe
                for dataframe in self.data
                if default_filter(
                    dataframe=dataframe,
                )
            ]
            if filter_callback(dataframe)
        ]

    def query(self, dataframe_list: list[pd.DataFrame], query: str) -> list[pd.DataFrame]:
        """Applies a panda query to all Dataframes of a list."""
        return [dataframe.query(query) for dataframe in dataframe_list]
