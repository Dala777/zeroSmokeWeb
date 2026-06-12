import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import json
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "linear_regression_v2.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_names.json")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")


def train_regression(features: list[dict], target: list[float]) -> dict:
    df = pd.DataFrame(features)
    y = np.array(target)

    feature_cols = list(df.columns)
    X = df.values

    model = LinearRegression()
    model.fit(X, y)

    y_pred = model.predict(X)

    r2 = float(r2_score(y, y_pred))
    mae = float(mean_absolute_error(y, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y, y_pred)))

    coefficients = {
        col: float(coef) for col, coef in zip(feature_cols, model.coef_)
    }

    importance = {}
    for col, coef in zip(feature_cols, model.coef_):
        importance[col] = abs(float(coef))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    with open(FEATURES_PATH, "w") as f:
        json.dump(feature_cols, f)

    metrics = {
        "r2": round(r2, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "intercept": float(model.intercept_),
        "coefficients": coefficients,
        "feature_importance": {
            k: round(v, 4) for k, v in sorted(importance.items(), key=lambda x: x[1], reverse=True)
        },
        "feature_names": feature_cols,
        "n_samples": len(y),
        "n_features": len(feature_cols),
        "last_training": __import__("datetime").datetime.now().isoformat(),
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    return {
        "r2": round(r2, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "intercept": float(model.intercept_),
        "coefficients": coefficients,
        "feature_importance": {
            k: round(v, 4) for k, v in sorted(importance.items(), key=lambda x: x[1], reverse=True)
        },
        "feature_names": feature_cols,
        "n_samples": len(y),
        "n_features": len(feature_cols),
    }


def predict_relapse_risk(features: dict) -> dict:
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError("No se encontró modelo entrenado. Ejecute /train-regression primero.")

    model = joblib.load(MODEL_PATH)
    with open(FEATURES_PATH, "r") as f:
        feature_names = json.load(f)

    df = pd.DataFrame([features])[feature_names]
    X = df.values

    risk = float(model.predict(X)[0])
    risk = max(0, min(100, risk))

    coef = model.coef_
    contributions = {}
    for name, c, fv in zip(feature_names, coef, X[0]):
        contributions[name] = abs(float(c * fv))

    top_factors = [
        k for k, _ in sorted(contributions.items(), key=lambda x: x[1], reverse=True)
    ][:3]

    return {
        "risk": round(risk, 2),
        "topFactors": top_factors,
    }


def get_model_info() -> dict:
    if not os.path.exists(MODEL_PATH):
        return {"status": "no_model", "message": "No hay modelo entrenado"}

    model = joblib.load(MODEL_PATH)
    with open(FEATURES_PATH, "r") as f:
        feature_names = json.load(f)

    info = {
        "status": "ready",
        "model_type": "LinearRegression",
        "n_features": len(feature_names),
        "feature_names": feature_names,
        "intercept": float(model.intercept_),
        "coefficients": {
            name: float(coef) for name, coef in zip(feature_names, model.coef_)
        },
    }

    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
            info.update(metrics)

    return info
