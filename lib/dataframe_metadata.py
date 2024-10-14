class DataframeMetadata:
    """A way to remember where a Dataframe comes from."""

    circuit: str
    gender: str
    year: str
    place: str
    run: str

    def __init__(
        self,
        circuit: str,
        gender: str,
        year: str,
        place: str,
        run: str,
    ) -> None:
        self.circuit = circuit
        self.gender = gender
        self.year = year
        self.place = place
        self.run = run

    def to_list(self) -> list[str]:
        """Returns the data in order."""
        return [self.circuit, self.gender, self.year, self.place, self.run]

    def __str__(self) -> str:  # noqa: D105
        return f"Race Metadata: {" ".join(self.to_list())}"
