import json
from pathlib import Path


class DataSource:
    """Used to extract data from a json file."""

    def __init__(self, path: str) -> None:
        self.path = path
        with Path(path).open() as f:
            print("loading")
            self.raw_data = json.load(f)
            print(self.raw_data)


if __name__ == "__main__": 
    source = DataSource("../data.json")
