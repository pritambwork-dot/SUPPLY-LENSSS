"""Pure-Python evaluation metrics: ROC-AUC, Precision, Recall, F1, and MAE."""
import math
from typing import List, Dict, Any, Tuple

def compute_binary_metrics(y_true: List[float], y_prob: List[float], threshold: float = 0.5) -> Dict[str, float]:
    """Compute Accuracy, Precision, Recall, F1, and ROC-AUC for binary classifiers."""
    assert len(y_true) == len(y_prob)
    n = len(y_true)
    if n == 0:
        return {"accuracy": 0.0, "precision": 0.0, "recall": 0.0, "f1": 0.0, "roc_auc": 0.5}

    tp = 0
    fp = 0
    fn = 0
    tn = 0

    for yt, yp in zip(y_true, y_prob):
        pred = 1.0 if yp >= threshold else 0.0
        if yt == 1.0 and pred == 1.0:
            tp += 1
        elif yt == 0.0 and pred == 1.0:
            fp += 1
        elif yt == 1.0 and pred == 0.0:
            fn += 1
        else:
            tn += 1

    accuracy = (tp + tn) / n
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    roc_auc = compute_roc_auc(y_true, y_prob)

    return {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4)
    }

def compute_roc_auc(y_true: List[float], y_prob: List[float]) -> float:
    """Compute Area Under ROC Curve via Mann-Whitney U statistic (equivalent to exact Wilcoxon rank-sum)."""
    paired = sorted(zip(y_prob, y_true), key=lambda x: x[0])
    n_pos = sum(1 for yt in y_true if yt == 1.0)
    n_neg = len(y_true) - n_pos

    if n_pos == 0 or n_neg == 0:
        return 0.5

    rank_sum_pos = 0.0
    for rank, (p, yt) in enumerate(paired, start=1):
        if yt == 1.0:
            rank_sum_pos += rank

    u_stat = rank_sum_pos - (n_pos * (n_pos + 1)) / 2.0
    auc = u_stat / (n_pos * n_neg)
    return max(0.0, min(1.0, auc))

def compute_regression_metrics(y_true: List[float], y_pred: List[float]) -> Dict[str, float]:
    """Compute MAE, RMSE, and R2 for regression models."""
    n = len(y_true)
    if n == 0:
        return {"mae": 0.0, "rmse": 0.0, "r2": 0.0}

    mae = sum(abs(yt - yp) for yt, yp in zip(y_true, y_pred)) / n
    mse = sum((yt - yp) ** 2 for yt, yp in zip(y_true, y_pred)) / n
    rmse = math.sqrt(mse)

    mean_yt = sum(y_true) / n
    ss_tot = sum((yt - mean_yt) ** 2 for yt in y_true)
    r2 = 1.0 - (mse * n / ss_tot) if ss_tot > 0 else 0.0

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4)
    }
