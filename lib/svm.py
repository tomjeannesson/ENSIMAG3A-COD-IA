import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from data_source import DataSource
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.svm import SVC

output_folder = "lib/etude_svm"
os.makedirs(output_folder, exist_ok=True)  # noqa: PTH103
print("    output_folder created")  # noqa: T201
source = DataSource("data.json")
qualifications = source.filter([["WC"], ["M"], [], [], ["Q"]], "include")
dataframe = qualifications[0]

dataframe = dataframe.drop(
    [
        "top_air_trick",
        "country",
        "bottom_air_trick",
        "first_name",
        "last_name",
        "birth_year",
        "fis_id",
        "bib",
        "tie",
    ],
    axis=1,
)
for _df in qualifications[1:]:
    _df = _df.drop(
        [
            "top_air_trick",
            "country",
            "bottom_air_trick",
            "first_name",
            "last_name",
            "birth_year",
            "fis_id",
            "bib",
            "tie",
        ],
        axis=1,
    )
    dataframe = pd.concat([dataframe, _df], axis=0)
results = dataframe["result"]
dataframe = dataframe.drop("result", axis=1).apply(
    lambda col: (abs(col) - abs(col).min()) / (abs(col).max() - abs(col).min()),
    axis=0,
)
dataframe["result"] = results
qualified_breakpoint = 16
dataframe["qualified"] = dataframe["result"] <= qualified_breakpoint

X = dataframe[["ski_base", "top_air_points", "bottom_air_points", "ski_deduction_total", "time_points"]]
Y = dataframe["qualified"]
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2)

param_grid = {"C": [x / 2 for x in range(1, 21)], "gamma": [x / 20 for x in range(20)], "kernel": ["rbf", "linear"]}
grid = GridSearchCV(SVC(), param_grid, refit=True, cv=5, scoring="accuracy")
grid.fit(X_train, Y_train)

best_model = grid.best_estimator_

best_model.fit(X_train, Y_train)
Y_pred = best_model.predict(X_test)
print(classification_report(Y_test, Y_pred))  # noqa: T201
cnf_matrix = confusion_matrix(Y_test, Y_pred)


class_names = [0, 1]
fig, ax = plt.subplots()
tick_marks = np.arange(len(class_names))
plt.xticks(tick_marks, class_names)
plt.yticks(tick_marks, class_names)
sns.heatmap(pd.DataFrame(cnf_matrix), annot=True, cmap="YlGnBu", fmt="g")
ax.xaxis.set_label_position("top")
plt.title("Confusion matrix", y=1.1)
plt.ylabel("Actual label")
plt.xlabel("Predicted label")
plt.savefig(os.path.join(output_folder, "confusion_matrix.png"))  # noqa: PTH118
