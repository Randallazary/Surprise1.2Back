import sys
import os
import joblib
import traceback

# Configuración de rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'modelo_ocasion.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'vectorizer_ocasion.pkl')

def load_models():
    """Carga los modelos con verificación de errores"""
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        return model, vectorizer
    except Exception as e:
        print(f"ERROR_MODEL_LOAD: {str(e)}", file=sys.stderr)
        sys.exit(1)

def predict(text):
    """Realiza la predicción con manejo de errores"""
    try:
        model, vectorizer = load_models()
        X = vectorizer.transform([text])
        return model.predict(X)[0]
    except Exception as e:
        print(f"ERROR_PREDICTION: {traceback.format_exc()}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    try:
        text = sys.argv[1]  # Recibe el texto como argumento
        result = predict(text)
        print(result)
    except IndexError:
        print("ERROR: No se proporcionó texto para clasificar", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR_MAIN: {str(e)}", file=sys.stderr)
        sys.exit(1)