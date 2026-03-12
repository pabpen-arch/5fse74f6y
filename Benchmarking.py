import pandas as pd
import json
import re
import os

excel_path = r"C:\Users\usu-calfnc_37\Documents\Datamarshall\4.Canales\3.Canal Virtual\Benchmarking.xlsx"
output_path = r"C:\Users\usu-calfnc_37\Documents\Datamarshall\1.Scripts\DigitalCommandCenter_HTML\benchmark.json"

def parse_percentage(value):
    if pd.isna(value):
        return 0

    value = str(value)
    numbers = re.findall(r"\d+", value)

    if len(numbers) == 1:
        return float(numbers[0])

    if len(numbers) >= 2:
        return (float(numbers[0]) + float(numbers[1])) / 2

    return 0


def clean_columns(df):
    df.columns = df.columns.str.strip()
    return df


benchmark_data = []

# ===============================
# HOJA 1: CDAT DIGITAL
# ===============================

df_cdat = pd.read_excel(excel_path, sheet_name=0)
df_cdat = clean_columns(df_cdat)

for _, row in df_cdat.iterrows():

    entidad = row.get("Segmento de Entidad")
    porcentaje = parse_percentage(row.get("% Apertura Digital (Autogestionada)"))

    if pd.notna(entidad):
        benchmark_data.append({
            "Entidad": f"CDAT - {entidad}",
            "Adopcion": round(porcentaje, 1)
        })

# ===============================
# HOJA 2: PAP DIGITAL
# ===============================

df_pap = pd.read_excel(excel_path, sheet_name=1)
df_pap = clean_columns(df_pap)

for _, row in df_pap.iterrows():

    entidad = row.get("Canal / Entidad")
    porcentaje = parse_percentage(row.get("% Autogestionado"))

    if pd.notna(entidad):
        benchmark_data.append({
            "Entidad": f"PAP - {entidad}",
            "Adopcion": round(porcentaje, 1)
        })

# Crear carpeta si no existe
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(benchmark_data, f, indent=4, ensure_ascii=False)

print("✅ benchmark.json generado correctamente y sin errores.")