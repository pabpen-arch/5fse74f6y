import pandas as pd
import json
import numpy as np
import os
from openpyxl import load_workbook

# ==========================================================
# Función para obtener la ruta base
# ==========================================================
def ruta_relativa(*sub_ruta):
    return os.path.abspath(os.path.join(os.path.dirname(__file__), *sub_ruta))

# 🔵 Rutas
excel_path = ruta_relativa('..', '..', '4.Canales', '3.Canal Virtual', 'Consolidado_Cierre_Autogestionables.xlsx')
output_path = ruta_relativa('..', '..', '1.Scripts', 'DigitalCommandCenter_HTML', 'data.json')

# Leer Excel
df = pd.read_excel(excel_path, engine="openpyxl")

# 🔵 Reemplazar NaN por 0
df = df.fillna(0)

# 🔵 Normalizar fecha
df["Fecha"] = pd.to_datetime(df["Fecha"]).dt.strftime("%Y-%m-%d")

# 🔵 Columnas numéricas a convertir a entero
numeric_columns = [
    "Meta",
    "Valor Total",
    "Valor Autogestionado",
    "Valor Asesor",
    "Prom Monto",
    "Plazo Promedio",
    "Prom Monto Autogestionado",
    "Plazo Prom Auto",
    "Prom Monto Asesor",
    "Plazo Prom Asesor",
    "Cantidad Total",
    "Cantidad Autogestionado",
    "Cantidad Asesor"
    
]

# Convertir todo a entero
for col in numeric_columns:
    df[col] = df[col].round(0).astype(int)

products = []

for product_name, group in df.groupby("Indicador"):

    group = group.sort_values("Fecha")

    monthly_data = []

    for _, row in group.iterrows():

        monthly_data.append({
            "mes": row["Fecha"],

            "meta": row["Meta"],

            "valorTotal": row["Valor Total"],
            "valorAutogestionado": row["Valor Autogestionado"],
            "valorAsesor": row["Valor Asesor"],

            "promMonto": row["Prom Monto"],
            "plazoPromedio": row["Plazo Promedio"],

            "promMontoAutogestionado": row["Prom Monto Autogestionado"],
            "plazoPromAutogestionado": row["Plazo Prom Auto"],

            "promMontoAsesor": row["Prom Monto Asesor"],
            "plazoPromAsesor": row["Plazo Prom Asesor"],
            "cantidadTotal": row["Cantidad Total"],
            "cantidadAutogestionado": row["Cantidad Autogestionado"],
            "cantidadAsesor": row["Cantidad Asesor"]
        })

    products.append({
        "name": product_name,
        "monthlyData": monthly_data
    })

final_json = {"products": products}

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(final_json, f, indent=4)

print("✅ data.json actualizado correctamente (enteros y sin NaN).")