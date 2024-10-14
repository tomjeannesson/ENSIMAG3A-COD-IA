import json
from pathlib import Path


class DataSource:
    """Used to extract data from a json file"""

    def __init__(self, path: str) -> None:
        self.path = pat h
        with Path.open(path) as f:
            self.raw_data = json.load(f)
