#! /usr/bin/env python3

import json
from pathlib import Path

import pandas as pd


class DataSource:
    """Used to extract data from a json file."""

    def __init__(self, path: str) -> None:
        self.path = path
        with Path(path).open() as f:
            self.raw_data = json.load(f)
            pd.json_normalize(self.raw_data)


if __name__ == "__main__":
    source = DataSource("data.json")
