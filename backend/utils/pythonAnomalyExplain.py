#!/usr/bin/env python3
import json
import os
import sys

import numpy as np
from sklearn.ensemble import IsolationForest

try:
    import shap
except Exception:
    shap = None


def main():
    payload = sys.stdin.read()
    data = json.loads(payload) if payload else {}
    points = data.get("points", [])
    contamination = float(data.get("contamination", 0.12))
    if not points:
        print(json.dumps({"error": "no_points"}))
        return

    X = np.array(points, dtype=float)
    if X.ndim == 1:
        X = X.reshape(-1, 1)

    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
    )
    model.fit(X)
    scores = model.decision_function(X).tolist()
    labels = model.predict(X).tolist()

    result = {
        "scores": scores,
        "labels": labels,
        "shap": None,
    }

    if shap:
        try:
            explainer = shap.Explainer(model, X)
            shap_values = explainer(X)
            result["shap"] = np.array(shap_values.values).tolist()
        except Exception as exc:
            result["shap_error"] = str(exc)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
