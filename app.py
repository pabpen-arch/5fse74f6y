import pandas as pd
import json
import os
from openpyxl import load_workbook

# ==========================================================
# Función para obtener la ruta base
# ==========================================================
def ruta_relativa(*sub_ruta):
    return os.path.abspath(os.path.join(os.path.dirname(__file__), *sub_ruta))

# ===============================
# RUTA ARCHIVO
# ===============================
file_path =ruta_relativa('..', '..', '1.Scripts', 'DigitalCommandCenter_HTML', 'Base instalada (Todos los dispositivos, Dispositivos únicos, Promedio de 30 días, Diarios).xlsx')
output_json = ruta_relativa('..', '..', '1.Scripts', 'DigitalCommandCenter_HTML', 'base_instalada.json')

# ===============================
# LEER ARCHIVO
# ===============================
df = pd.read_excel(file_path)

# ===============================
# LIMPIAR COLUMNAS
# ===============================
df.columns = df.columns.str.strip()

# Renombrar columnas para facilidad
df = df.rename(columns={
    df.columns[0]: "Fecha",
    df.columns[1]: "Global",
    df.columns[2]: "Colombia",
    df.columns[3]: "España",
    df.columns[4]: "USA",
    df.columns[5]: "Chile"
})

# ===============================
# FORMATEAR FECHA
# ===============================
# ===============================
# LIMPIAR Y CONVERTIR FECHA (ESPAÑOL)
# ===============================

meses = {
    "ene": "01",
    "feb": "02",
    "mar": "03",
    "abr": "04",
    "may": "05",
    "jun": "06",
    "jul": "07",
    "ago": "08",
    "sep": "09",
    "oct": "10",
    "nov": "11",
    "dic": "12"
}

def convertir_fecha(fecha):

    if pd.isna(fecha):
        return None

    fecha = str(fecha).lower()

    partes = fecha.split(" ")

    if len(partes) == 3:
        dia = partes[0]
        mes = meses.get(partes[1], "01")
        año = partes[2]

        return f"{año}-{mes}-{dia.zfill(2)}"

    return None

df["Fecha"] = df["Fecha"].apply(convertir_fecha)

df["Fecha"] = pd.to_datetime(df["Fecha"], errors="coerce")

# Crear columna mes
df["Mes"] = df["Fecha"].dt.to_period("M").astype(str)

df = df.dropna(subset=["Fecha"])

# ===============================
# AGRUPAR POR MES
# ===============================
grouped = df.groupby("Mes").agg({
    "Global": ["mean", "last"],
    "Colombia": ["mean", "last"],
    "España": ["mean", "last"],
    "USA": ["mean", "last"],
    "Chile": ["mean", "last"]
}).reset_index()

# Aplanar columnas
grouped.columns = [
    "Mes",
    "Global_prom", "Global_last",
    "Colombia_prom", "Colombia_last",
    "España_prom", "España_last",
    "USA_prom", "USA_last",
    "Chile_prom", "Chile_last"
]

# ===============================
# CALCULAR VARIACIÓN
# ===============================
for col in ["Global", "Colombia", "España", "USA", "Chile"]:
    grouped[f"{col}_var"] = grouped[f"{col}_last"].pct_change().fillna(0)

# ===============================
# CONVERTIR A JSON
# ===============================
result = []

for _, row in grouped.iterrows():

    result.append({
        "mes": row["Mes"],

        "Global": {
            "promedio": int(row["Global_prom"]),
            "valor": int(row["Global_last"]),
            "variacion": round(row["Global_var"] * 100, 2)
        },

        "Colombia": {
            "promedio": int(row["Colombia_prom"]),
            "valor": int(row["Colombia_last"]),
            "variacion": round(row["Colombia_var"] * 100, 2)
        },

        "España": {
            "promedio": int(row["España_prom"]),
            "valor": int(row["España_last"]),
            "variacion": round(row["España_var"] * 100, 2)
        },

        "USA": {
            "promedio": int(row["USA_prom"]),
            "valor": int(row["USA_last"]),
            "variacion": round(row["USA_var"] * 100, 2)
        },

        "Chile": {
            "promedio": int(row["Chile_prom"]),
            "valor": int(row["Chile_last"]),
            "variacion": round(row["Chile_var"] * 100, 2)
        }
    })

# ===============================
# GUARDAR JSON
# ===============================
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=4)

print("✅ base_instalada.json generado correctamente")