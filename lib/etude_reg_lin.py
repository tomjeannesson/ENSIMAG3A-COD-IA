import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from data_source import DataSource
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

"""check that the directory exist"""
output_folder = "lib/etude_regLin"
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

# top_air_points, bottom_air_points, time_points, ski_deduction_total, ski_base
# donnée à prédire : qualified

X = dataframe[["top_air_points", "bottom_air_points", "time_points", "ski_deduction_total", "ski_base"]]
Y = dataframe["qualified"]

X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=16)
model = LogisticRegression(random_state=16)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2f}")  # noqa: T201

print("Confusion Matrix:")  # noqa: T201
cnf_matrix = confusion_matrix(y_test, y_pred)
print(cnf_matrix)  # noqa: T201

print("Classification Report:")  # noqa: T201
print(classification_report(y_test, y_pred))  # noqa: T201

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
