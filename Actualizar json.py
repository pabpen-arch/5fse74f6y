import pandas as pd
import json
import numpy as np

# 🔵 Rutas
excel_path = r"C:\Users\usu-calfnc_37\Documents\Datamarshall\4.Canales\3.Canal Virtual\Consolidado_Cierre_Autogestionables.xlsx"
output_path = r"C:\Users\usu-calfnc_37\Documents\Datamarshall\1.Scripts\DigitalCommandCenter_HTML\data.json"

# Leer Excel
df = pd.read_excel(excel_path, engine="openpyxl")

# 🔵 Reemplazar NaN por 0
df = df.fillna(0)

# 🔵 Normalizar fecha
df["Fecha"] = pd.to_datetime(df["Fecha"]).dt.strftime("%Y-%m-%d")

# 🔵 Columnas numéricas a convertir a entero
numeric_columns = [
    "Valor Total",
    "Valor Autogestionado",
    "Valor Asesor",
    "Prom Monto",
    "Plazo Promedio",
    "Prom Monto Autogestionado",
    "Plazo Prom Autogestionado",
    "Prom Monto Asesor",
    "Plazo Prom Asesor"
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

            "valorTotal": row["Valor Total"],
            "valorAutogestionado": row["Valor Autogestionado"],
            "valorAsesor": row["Valor Asesor"],

            "promMonto": row["Prom Monto"],
            "plazoPromedio": row["Plazo Promedio"],

            "promMontoAutogestionado": row["Prom Monto Autogestionado"],
            "plazoPromAutogestionado": row["Plazo Prom Autogestionado"],

            "promMontoAsesor": row["Prom Monto Asesor"],
            "plazoPromAsesor": row["Plazo Prom Asesor"]
        })

    products.append({
        "name": product_name,
        "monthlyData": monthly_data
    })

final_json = {"products": products}

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(final_json, f, indent=4)

print("✅ data.json actualizado correctamente (enteros y sin NaN).")