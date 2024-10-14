import json
from pathlib import Path

import pandas as pd


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
        for circuit in current_data:
            new_data[circuit] = {}
            for gender in current_data[circuit]:
                new_data[circuit][gender] = {}
                for year in current_data[circuit][gender]:
                    new_data[circuit][gender][year] = {}
                    for race in current_data[circuit][gender][year]:
                        new_data[circuit][gender][year][race] = {}
                        for run in current_data[circuit][gender][year][race]:
                            new_data[circuit][gender][year][race][run] = pd.DataFrame(data=json.loads(current_data[circuit][gender][year][race][run]))
        self.data = new_data


if __name__ == "__main__":
    source = DataSource("data.json")
