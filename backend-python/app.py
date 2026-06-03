import os
import json
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from train import train_regression, predict_relapse_risk, get_model_info

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "zerosmoke-ml",
        "version": "2.0.0",
    })


@app.route("/train-regression", methods=["POST"])
def train():
    try:
        body = request.get_json()
        if not body:
            return jsonify({"error": "Cuerpo JSON requerido"}), 400

        features = body.get("features")
        target = body.get("target")

        if not features or target is None:
            return jsonify({"error": "Se requieren 'features' (array) y 'target' (array)"}), 400

        if len(features) < 10:
            return jsonify({"error": f"Se requieren al menos 10 muestras (recibidas {len(features)})"}), 400

        if len(features) != len(target):
            return jsonify({"error": "La longitud de features y target debe coincidir"}), 400

        result = train_regression(features, target)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-relapse-risk", methods=["POST"])
def predict():
    try:
        body = request.get_json()
        if not body:
            return jsonify({"error": "Cuerpo JSON requerido"}), 400

        features = body.get("features")
        if not features:
            return jsonify({"error": "Se requiere 'features' (object)"}), 400

        result = predict_relapse_risk(features)
        return jsonify(result)

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/model-info", methods=["GET"])
def model_info():
    try:
        info = get_model_info()
        return jsonify(info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
