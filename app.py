import pandas as pd
import json
import os
import re

# ==========================================================
# Función para obtener la ruta base
# ==========================================================
def ruta_relativa(*sub_ruta):
    return os.path.abspath(os.path.join(os.path.dirname(__file__), *sub_ruta))

# ===============================
# CARPETA BASE
# ===============================
carpeta_base = ruta_relativa('..', '..', '1.Scripts', 'DigitalCommandCenter_HTML')

# ===============================
# ARCHIVOS A PROCESAR
# ===============================
archivos = [
    {
        "input": "Base instalada (Todos los dispositivos, Dispositivos únicos, Promedio de 30 días, Diarios).xlsx",
        "output": "base_instalada.json",
        "tipo": "paises"
    },
    {
        "input": "Usuarios recurrentes mensuales (Usuarios únicos, Promedio de 30 días, Diarios).xlsx",
        "output": "usuarios_recurrentes_mensuales.json",
        "tipo": "paises"
    },
    {
        "input": "Valoración en Google Play (Por intervalo, Diarios).xlsx",
        "output": "valoracion_google_play.json",
        "tipo": "paises"
    },
    {
        "input": "Dispositos Activos Sistema IOS.xlsx",
        "output": "dispositivos_activos_ios.json",
        "tipo": "ios"
    }
]

# ===============================
# MESES EN ESPAÑOL
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

# ===============================
# FUNCIONES AUXILIARES
# ===============================
def convertir_fecha_es(fecha):
    """
    Convierte fechas como '6 mar 2021' a datetime.
    """
    if pd.isna(fecha):
        return pd.NaT

    # Si ya viene como fecha
    if isinstance(fecha, pd.Timestamp):
        return fecha

    fecha = str(fecha).strip().lower()
    partes = fecha.split()

    if len(partes) == 3:
        dia = partes[0]
        mes_txt = partes[1][:3]
        anio = partes[2]

        mes_num = meses.get(mes_txt)
        if mes_num:
            fecha_formateada = f"{anio}-{mes_num}-{str(dia).zfill(2)}"
            return pd.to_datetime(fecha_formateada, errors="coerce")

    # Intento adicional por si viene en otro formato
    return pd.to_datetime(fecha, errors="coerce")


def convertir_numero(valor):
    """
    Convierte números y limpia valores como '-'
    """
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor in ["", "-", "–", "nan", "None"]:
        return None

    # Quitar separadores extraños si existen
    valor = valor.replace("\xa0", "").strip()

    try:
        return float(valor)
    except:
        try:
            # Por si llega en formato con coma decimal
            valor = valor.replace(".", "").replace(",", ".")
            return float(valor)
        except:
            return None


def redondear_valor(valor, decimales=2):
    if pd.isna(valor) or valor is None:
        return None
    return round(float(valor), decimales)


def normalizar_nombre_columna(col):
    """
    Limpia nombres de columnas para facilitar detección.
    """
    col = str(col).replace("\xa0", " ").strip()
    return col


# ===============================
# PROCESAR ARCHIVOS TIPO PAISES
# ===============================
def procesar_archivo_paises(file_path):
    df = pd.read_excel(file_path)
    df.columns = [normalizar_nombre_columna(c) for c in df.columns]

    # Renombrado dinámico según contenido del nombre de columna
    rename_map = {}

    for col in df.columns:
        col_lower = col.lower()

        if col == "Fecha":
            rename_map[col] = "Fecha"
        elif "todos los países o regiones" in col_lower:
            rename_map[col] = "Global"
        elif "colombia" in col_lower:
            rename_map[col] = "Colombia"
        elif "españa" in col_lower:
            rename_map[col] = "España"
        elif "estados unidos" in col_lower:
            rename_map[col] = "USA"
        elif "chile" in col_lower:
            rename_map[col] = "Chile"
        elif "notas" in col_lower:
            rename_map[col] = "Notas"

    df = df.rename(columns=rename_map)

    columnas_objetivo = ["Fecha", "Global", "Colombia", "España", "USA", "Chile"]
    columnas_presentes = [c for c in columnas_objetivo if c in df.columns]

    df = df[columnas_presentes].copy()

    # Fecha
    df["Fecha"] = df["Fecha"].apply(convertir_fecha_es)
    df = df.dropna(subset=["Fecha"]).copy()

    # Métricas
    metricas = [c for c in ["Global", "Colombia", "España", "USA", "Chile"] if c in df.columns]

    for col in metricas:
        df[col] = df[col].apply(convertir_numero)

    # Agrupar por mes
    df["Mes"] = df["Fecha"].dt.to_period("M").astype(str)

    agg_dict = {col: ["mean", "last"] for col in metricas}
    grouped = df.groupby("Mes").agg(agg_dict).reset_index()

    # Aplanar columnas
    nuevas_columnas = ["Mes"]
    for col in metricas:
        nuevas_columnas.extend([f"{col}_prom", f"{col}_last"])
    grouped.columns = nuevas_columnas

    # Variación
    for col in metricas:
        grouped[f"{col}_var"] = grouped[f"{col}_last"].pct_change()

    # JSON final
    result = []

    for _, row in grouped.iterrows():
        item = {"mes": row["Mes"]}

        for col in metricas:
            item[col] = {
                "promedio": redondear_valor(row[f"{col}_prom"], 2),
                "valor": redondear_valor(row[f"{col}_last"], 2),
                "variacion": 0 if pd.isna(row[f"{col}_var"]) else round(float(row[f"{col}_var"]) * 100, 2)
            }

        result.append(item)

    return result


# ===============================
# PROCESAR ARCHIVO IOS
# ===============================
def procesar_archivo_ios(file_path):
    df = pd.read_excel(file_path)
    df.columns = [normalizar_nombre_columna(c) for c in df.columns]

    # Validar columnas esperadas
    if "Fecha" not in df.columns or "Dispositivos activos" not in df.columns:
        raise ValueError("El archivo IOS no tiene las columnas esperadas: 'Fecha' y 'Dispositivos activos'")

    df = df[["Fecha", "Dispositivos activos"]].copy()

    df["Fecha"] = pd.to_datetime(df["Fecha"], errors="coerce")
    df["Dispositivos activos"] = df["Dispositivos activos"].apply(convertir_numero)

    df = df.dropna(subset=["Fecha"]).copy()

    # Ya viene mensual, pero igual agrupamos por seguridad
    df["Mes"] = df["Fecha"].dt.to_period("M").astype(str)

    grouped = df.groupby("Mes").agg({
        "Dispositivos activos": ["mean", "last"]
    }).reset_index()

    grouped.columns = ["Mes", "iOS_prom", "iOS_last"]
    grouped["iOS_var"] = grouped["iOS_last"].pct_change()

    result = []

    for _, row in grouped.iterrows():
        result.append({
            "mes": row["Mes"],
            "iOS": {
                "promedio": redondear_valor(row["iOS_prom"], 2),
                "valor": redondear_valor(row["iOS_last"], 2),
                "variacion": 0 if pd.isna(row["iOS_var"]) else round(float(row["iOS_var"]) * 100, 2)
            }
        })

    return result


# ===============================
# EJECUCIÓN PRINCIPAL
# ===============================
for archivo in archivos:
    input_path = os.path.join(carpeta_base, archivo["input"])
    output_path = os.path.join(carpeta_base, archivo["output"])

    try:
        if archivo["tipo"] == "paises":
            resultado = procesar_archivo_paises(input_path)
        elif archivo["tipo"] == "ios":
            resultado = procesar_archivo_ios(input_path)
        else:
            raise ValueError(f"Tipo no soportado: {archivo['tipo']}")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(resultado, f, indent=4, ensure_ascii=False)

        print(f"✅ JSON generado correctamente: {archivo['output']}")

    except Exception as e:
        print(f"❌ Error procesando {archivo['input']}: {e}")