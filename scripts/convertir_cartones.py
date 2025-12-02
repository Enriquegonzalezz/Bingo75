"""
Script para convertir cartones de formato texto a JSON
Formato de entrada: BINGO CARABOBO;ID;N1;N2;...;N24 (24 números, sin el centro)
El centro (posición 13 en la matriz 5x5) es siempre 0
"""

import json
from datetime import datetime
import os
import random

def parsear_linea(linea: str) -> dict | None:
    """
    Parsea una línea del formato:
    BINGO CARABOBO;1;9;8;11;2;4;20;16;25;18;24;38;41;42;34;59;49;53;57;47;68;65;66;64;67
    
    Los 24 números se distribuyen así (por columnas B,I,N,G,O):
    - B: posiciones 0-4 (números 1-15)
    - I: posiciones 5-9 (números 16-30)
    - N: posiciones 10-14 (números 31-45, pero posición 12 es el centro = 0)
    - G: posiciones 15-19 (números 46-60)
    - O: posiciones 20-24 (números 61-75)
    """
    linea = linea.strip()
    if not linea:
        return None
    
    partes = linea.split(';')
    if len(partes) < 26:  # serial + id + 24 números
        print(f"Línea inválida (faltan datos): {linea[:50]}...")
        return None
    
    serial = partes[0]  # "BINGO CARABOBO"
    numero_carton = int(partes[1])  # ID del cartón
    
    # Los 24 números (sin el centro)
    numeros_raw = [int(x) for x in partes[2:26]]
    
    # Distribuir en columnas B, I, N, G, O
    # Cada columna tiene 5 números, pero N tiene el centro como 0
    b_nums = numeros_raw[0:5]    # 5 números
    i_nums = numeros_raw[5:10]   # 5 números
    n_nums_sin_centro = numeros_raw[10:12] + [0] + numeros_raw[12:14]  # 2 + centro(0) + 2 = 5
    g_nums = numeros_raw[14:19]  # 5 números
    o_nums = numeros_raw[19:24]  # 5 números
    
    # Crear estructura de números por letra
    numeros = {
        "B": b_nums,
        "I": i_nums,
        "N": n_nums_sin_centro,
        "G": g_nums,
        "O": o_nums
    }
    
    # Crear matriz 5x5 (filas)
    # Fila 0: B[0], I[0], N[0], G[0], O[0]
    # Fila 1: B[1], I[1], N[1], G[1], O[1]
    # etc.
    matriz = []
    for i in range(5):
        fila = [
            b_nums[i],
            i_nums[i],
            n_nums_sin_centro[i],
            g_nums[i],
            o_nums[i]
        ]
        matriz.append(fila)
    
    # Generar ID único
    timestamp = random.randint(1000000000, 9999999999)
    carton_id = f"carton-{timestamp}-{numero_carton - 1}"
    
    return {
        "id": carton_id,
        "serial": serial,
        "numero_carton": numero_carton,
        "numeros": numeros,
        "matriz": matriz
    }


def convertir_archivo(archivo_entrada: str, archivo_salida: str):
    """
    Lee el archivo de texto y genera el JSON de cartones
    """
    cartones = []
    
    # Leer archivo de entrada
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        lineas = f.readlines()
    
    print(f"Leyendo {len(lineas)} líneas del archivo...")
    
    for i, linea in enumerate(lineas):
        carton = parsear_linea(linea)
        if carton:
            cartones.append(carton)
            if (i + 1) % 1000 == 0:
                print(f"  Procesados {i + 1} cartones...")
    
    print(f"Total de cartones válidos: {len(cartones)}")
    
    # Crear estructura final
    resultado = {
        "version": "2.0",
        "fecha_generacion": datetime.now().isoformat(),
        "fecha_original": datetime.now().isoformat(),
        "total_cartones": len(cartones),
        "descripcion": f"{len(cartones):,} cartones de Bingo Carabobo importados desde archivo de texto",
        "cartones": cartones
    }
    
    # Guardar JSON
    with open(archivo_salida, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    
    print(f"Archivo guardado: {archivo_salida}")
    print(f"Tamaño: {os.path.getsize(archivo_salida) / 1024 / 1024:.2f} MB")
    
    return len(cartones)


def main():
    # Rutas
    script_dir = os.path.dirname(os.path.abspath(__file__))
    proyecto_dir = os.path.dirname(script_dir)
    
    # Archivo de entrada (el usuario debe colocar el archivo aquí)
    archivo_entrada = os.path.join(script_dir, "cartones_entrada.txt")
    
    # Archivo de salida
    archivo_salida = os.path.join(proyecto_dir, "src", "shared", "constants", "cartones.json")
    
    # Backup del archivo actual
    archivo_backup = os.path.join(proyecto_dir, "src", "shared", "constants", "cartones_backup.json")
    
    # Verificar que existe el archivo de entrada
    if not os.path.exists(archivo_entrada):
        print("=" * 60)
        print("ERROR: No se encontró el archivo de entrada")
        print(f"Por favor, crea el archivo: {archivo_entrada}")
        print()
        print("Formato esperado (una línea por cartón):")
        print("BINGO CARABOBO;1;9;8;11;2;4;20;16;25;18;24;38;41;42;34;59;49;53;57;47;68;65;66;64;67")
        print("BINGO CARABOBO;2;6;14;3;10;13;30;17;22;21;28;37;45;40;35;50;51;54;58;56;63;69;75;62;70")
        print("...")
        print("=" * 60)
        
        # Crear archivo de ejemplo
        ejemplo = """BINGO CARABOBO;1;9;8;11;2;4;20;16;25;18;24;38;41;42;34;59;49;53;57;47;68;65;66;64;67
BINGO CARABOBO;2;6;14;3;10;13;30;17;22;21;28;37;45;40;35;50;51;54;58;56;63;69;75;62;70
BINGO CARABOBO;3;15;12;5;1;7;19;27;26;23;29;43;39;33;31;48;52;60;46;55;72;61;74;73;71"""
        
        with open(archivo_entrada, 'w', encoding='utf-8') as f:
            f.write(ejemplo)
        
        print(f"\nSe creó un archivo de ejemplo con 3 cartones: {archivo_entrada}")
        print("Reemplaza el contenido con tus cartones y vuelve a ejecutar el script.")
        return
    
    # Hacer backup si existe el archivo actual
    if os.path.exists(archivo_salida):
        print(f"Creando backup: {archivo_backup}")
        import shutil
        shutil.copy2(archivo_salida, archivo_backup)
    
    # Convertir
    print("=" * 60)
    print("CONVERSIÓN DE CARTONES")
    print("=" * 60)
    total = convertir_archivo(archivo_entrada, archivo_salida)
    print("=" * 60)
    print(f"¡Listo! Se convirtieron {total:,} cartones")
    print("=" * 60)


if __name__ == "__main__":
    main()
