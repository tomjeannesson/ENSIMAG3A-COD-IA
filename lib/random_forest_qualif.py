from collections import Counter

import numpy as np


class Node:
    """Class to define a single node of a decision tree."""

    def __init__(
        self, feature: "int | None" = None, threshold: "float | None" = None, left: "Node" = None, right: "Node" = None, value: "float | None" = None
    ) -> None:
        """Initialize a node in a tree.

        Args:
            feature (int, optional): The index of the characteristic used for the fractionation. Defaults to None.
            threshold (float, optional): The threshold value for fractionation. Defaults to None.
            left (Node, optional): under left tree. Defaults to None.
            right (Node, optional): under right tree. Defaults to None.
            value (float, optional): If it is a leaf, the prediction value. Defaults to None.
        """
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    def is_leaf_node(self) -> bool:
        """_Returns True if the node is a leaf.

        Returns:
            bool: True if the node is a leaf, False otherwise.
        """
        return self.value is not None


class RandomForest:
    """Class which handles the tree and the predictions."""

    def __init__(self, n_trees: int = 10, max_depth: int = 5, min_samples_split: int = 2) -> None:
        """Initialisation of a random forest.

        Args:
            n_trees (int, optional): Number of trees in the forest. Defaults to 10.
            max_depth (int, optional): _Maximum depth of a tree_. Defaults to 5.
            min_samples_split (int, optional): Minimum number of samples to do a fractionation. Defaults to 2.
            trees (list): List of decision trees in the forest.
        """
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []

    def fit(self, x: np.ndarray, y: np.ndarray) -> None:
        """Trains the Random Forest by building multiple decision trees.

        Parameters:
            x (np.ndarray): The feature matrix.
            y (np.ndarray): The target vector.

        Returns:
            None
        """
        for _ in range(self.n_trees):
            x_sample, y_sample = self._bootstrap_sample(x, y)
            tree = self._build_tree(x_sample, y_sample)
            self.trees.append(tree)

    def predict(self, x: np.ndarray) -> list:
        """Predicts the labels for the given dataset using the Random Forest.

        Parameters:
            x (np.ndarray): The feature matrix.

        Returns:
            list: Predicted labels for each sample.
        """
        tree_preds = np.array([self._traverse_tree(xx, tree) for tree in self.trees for xx in x])
        tree_preds = tree_preds.reshape(self.n_trees, x.shape[0]).T
        return [Counter(tree_preds[i]).most_common(1)[0][0] for i in range(len(x))]

    def _bootstrap_sample(self, x: np.ndarray, y: np.ndarray) -> tuple:
        """Creates a bootstrap sample from the dataset.

        Parameters:
            x (np.ndarray): The feature matrix.
            y (np.ndarray): The target vector.

        Returns:
            tuple: Bootstrapped feature matrix and target vector.
        """
        n_samples = x.shape[0]
        indices = np.random.default_rng().choice(n_samples, n_samples, replace=True)
        return x[indices], y[indices]

    def _build_tree(self, x: np.ndarray, y: np.ndarray, depth: int = 0) -> Node:
        """Builds a decision tree recursively.

        Parameters:
            x (np.ndarray): The feature matrix.
            y (np.ndarray): The target vector.
            depth (int): The current depth of the tree.

        Returns:
            Node: The root of the decision tree.
        """
        n_samples, n_features = x.shape
        n_labels = len(np.unique(y))

        if depth >= self.max_depth or n_labels == 1 or n_samples < self.min_samples_split:
            leaf_value = self._most_common_label(y)
            return Node(value=leaf_value)

        feature_idxs = np.random.default_rng().choice(n_features, n_features, replace=False)

        best_feature, best_threshold = self._best_criteria(x, y, feature_idxs)

        left_idxs, right_idxs = self._split(x[:, best_feature], best_threshold)
        left = self._build_tree(x[left_idxs, :], y[left_idxs], depth + 1)
        right = self._build_tree(x[right_idxs, :], y[right_idxs], depth + 1)
        return Node(best_feature, best_threshold, left, right)

    def _best_criteria(self, x: np.ndarray, y: np.ndarray, feature_idxs: np.ndarray) -> tuple:
        """Finds the best feature and threshold for splitting the data.

        Parameters:
            x (np.ndarray): The feature matrix.
            y (np.ndarray): The target vector.
            feature_idxs (np.ndarray): Indices of features to consider.

        Returns:
            tuple: Best feature index and threshold value.
        """
        best_gain = -1
        split_idx, split_thresh = None, None

        for feature_idx in feature_idxs:
            x_column = x[:, feature_idx]
            thresholds = np.unique(x_column)

            for threshold in thresholds:
                gain = self._information_gain(y, x_column, threshold)

                if gain > best_gain:
                    best_gain = gain
                    split_idx = feature_idx
                    split_thresh = threshold

        return split_idx, split_thresh

    def _information_gain(self, y: np.ndarray, x_column: np.ndarray, split_thresh: float) -> float:
        """Calculates the information gain for a potential split.

        Parameters:
            y (np.ndarray): The target vector.
            x_column (np.ndarray): The feature column.
            split_thresh (float): The threshold for splitting.

        Returns:
            float: The information gain.
        """
        parent_entropy = self._entropy(y)

        left_idxs, right_idxs = self._split(x_column, split_thresh)

        if len(left_idxs) == 0 or len(right_idxs) == 0:
            return 0

        n = len(y)
        n_l, n_r = len(left_idxs), len(right_idxs)
        e_l, e_r = self._entropy(y[left_idxs]), self._entropy(y[right_idxs])
        child_entropy = (n_l / n) * e_l + (n_r / n) * e_r

        return parent_entropy - child_entropy

    def _split(self, x_column: np.ndarray, split_thresh: float) -> tuple:
        """Splits the dataset into two subsets based on a threshold.

        Parameters:
            x_column (np.ndarray): The feature column.
            split_thresh (float): The threshold for splitting.

        Returns:
            tuple: Indices of the left and right splits.
        """
        left_idxs = np.argwhere(x_column <= split_thresh).flatten()
        right_idxs = np.argwhere(x_column > split_thresh).flatten()
        return left_idxs, right_idxs

    def _entropy(self, y: np.ndarray) -> float:
        """Calculates the entropy of the target labels.

        Parameters:
            y (np.ndarray): The target vector.

        Returns:
            float: The entropy value.
        """
        hist = np.bincount(y)
        ps = hist / len(y)
        return -np.sum([p * np.log2(p) for p in ps if p > 0])

    def _most_common_label(self, y: np.ndarray) -> int:
        """Finds the most common label in the dataset.

        Parameters:
            y (np.ndarray): The target vector.

        Returns:
            int: The most common label.
        """
        return Counter(y).most_common(1)[0][0]

    def _traverse_tree(self, x: np.ndarray, tree: "Node") -> int:
        """Traverses the decision tree to predict the label for a single sample.

        Parameters:
            x (np.ndarray): The feature vector of a single sample.
            tree (Node): The root of the decision tree.

        Returns:
            int: The predicted label.
        """
        if tree.is_leaf_node():
            return tree.value

        if x[tree.feature] <= tree.threshold:
            return self._traverse_tree(x, tree.left)
        return self._traverse_tree(x, tree.right)
