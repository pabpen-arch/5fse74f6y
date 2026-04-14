# -*- coding: utf-8 -*-
import pandas as pd
import json
import os

# ==========================================================
# Función para obtener la ruta base
# ==========================================================
def ruta_relativa(*sub_ruta):
    return os.path.abspath(os.path.join(os.path.dirname(__file__), *sub_ruta))

# Load file
file_path = ruta_relativa('..', '..', '4.Canales', '3.Canal Virtual', '19.Brigadas', 'Brigadas Empresas.xlsx')
df = pd.read_excel(file_path, sheet_name="Seguimiento Diario Brigadas")

# Normalize column names (strip spaces)
df.columns = [c.strip() for c in df.columns]

# Try to detect date column
date_col = None
for c in df.columns:
    if "fecha" in c.lower():
        date_col = c
        break

if date_col is None:
    raise ValueError("No se encontró columna de fecha")

# Convert to datetime
df[date_col] = pd.to_datetime(df[date_col], errors="coerce")

# Create Month column
df["Mes"] = df[date_col].dt.to_period("M").astype(str)

# Detect relevant columns
def find_col(possible_names):
    for c in df.columns:
        for name in possible_names:
            if name in c.lower():
                return c
    return None

estado_col = find_col(["estado"])
canal_col = find_col(["canal"])
ciudad_col = find_col(["ciudad"])

if not all([estado_col, canal_col, ciudad_col]):
    raise ValueError("No se encontraron todas las columnas requeridas (estado, canal, ciudad)")

# Total brigadas per month
total_mes = df.groupby("Mes").size().rename("Total Brigadas").reset_index()

# Function to calculate counts + %
def calcular_tabla(col):
    tabla = df.groupby(["Mes", col]).size().reset_index(name="Cantidad")
    total = df.groupby("Mes").size().reset_index(name="Total")
    tabla = tabla.merge(total, on="Mes")
    tabla["%"] = tabla["Cantidad"] / tabla["Total"]
    return tabla

estado_df = calcular_tabla(estado_col)
canal_df = calcular_tabla(canal_col)
ciudad_df = calcular_tabla(ciudad_col)

# Save Excel
output_excel = ruta_relativa('..', '..', '1.Scripts', 'DigitalCommandCenter_HTML', 'Analisis_Brigadas.xlsx')
with pd.ExcelWriter(output_excel, engine="openpyxl") as writer:
    total_mes.to_excel(writer, sheet_name="Total", index=False)
    estado_df.to_excel(writer, sheet_name="Por Estado", index=False)
    canal_df.to_excel(writer, sheet_name="Por Canal", index=False)
    ciudad_df.to_excel(writer, sheet_name="Por Ciudad", index=False)

# Save JSON
output_json = ruta_relativa('..', '..', '1.Scripts', 'DigitalCommandCenter_HTML', 'Analisis_Brigadas.json')

json_data = {
    "total_mes": total_mes.to_dict(orient="records"),
    "por_estado": estado_df.to_dict(orient="records"),
    "por_canal": canal_df.to_dict(orient="records"),
    "por_ciudad": ciudad_df.to_dict(orient="records")
}

with open(output_json, "w", encoding="utf-8") as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)

output_excel, output_json