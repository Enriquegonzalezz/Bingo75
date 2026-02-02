"""
Script para generar 4 paquetes adicionales de 10k cartones únicos.
Cada paquete tendrá cartones completamente diferentes.
"""

import json
import random
from datetime import datetime
from pathlib import Path


def generar_carton(numero_carton: int, seed_offset: int = 0) -> dict:
    """
    Genera un cartón de bingo válido.

    Reglas:
    - Columna B: números del 1-15 (5 números)
    - Columna I: números del 16-30 (5 números)
    - Columna N: números del 31-45 (5 números, centro es FREE = 0)
    - Columna G: números del 46-60 (5 números)
    - Columna O: números del 61-75 (5 números)
    """
    rangos = {
        'B': (1, 15),
        'I': (16, 30),
        'N': (31, 45),
        'G': (46, 60),
        'O': (61, 75)
    }

    numeros = {}

    for letra, (min_val, max_val) in rangos.items():
        nums = random.sample(range(min_val, max_val + 1), 5)
        if letra == 'N':
            nums[2] = 0
        numeros[letra] = nums

    matriz = []
    for fila in range(5):
        fila_nums = [
            numeros['B'][fila],
            numeros['I'][fila],
            numeros['N'][fila],
            numeros['G'][fila],
            numeros['O'][fila]
        ]
        matriz.append(fila_nums)

    timestamp = int(datetime.now().timestamp())
    carton_id = f"carton-{timestamp}-{seed_offset}-{numero_carton}"

    return {
        "id": carton_id,
        "serial": "BINGO carabobo",
        "numero_carton": numero_carton,
        "numeros": numeros,
        "matriz": matriz
    }


def generar_cartones_unicos(cantidad: int, inicio: int, seed: int) -> list:
    """
    Genera una cantidad específica de cartones únicos.
    Verifica que no haya cartones duplicados (misma matriz).
    """
    random.seed(seed)
    cartones = []
    matrices_vistas = set()

    intentos = 0
    max_intentos = cantidad * 10

    while len(cartones) < cantidad and intentos < max_intentos:
        numero_carton = inicio + len(cartones)
        carton = generar_carton(numero_carton, seed)

        matriz_tuple = tuple(tuple(fila) for fila in carton['matriz'])

        if matriz_tuple not in matrices_vistas:
            matrices_vistas.add(matriz_tuple)
            cartones.append(carton)

            if len(cartones) % 1000 == 0:
                print(f"  Generados {len(cartones)} cartones...")

        intentos += 1

    if len(cartones) < cantidad:
        print(f"⚠️ Solo se pudieron generar {len(cartones)} cartones únicos")

    return cartones


def crear_paquete(nombre: str, paquete_id: str, seed: int, cantidad: int = 10000):
    """Crea un paquete de cartones."""
    print(f"\n🎲 Generando paquete '{nombre}' ({paquete_id})...")
    cartones = generar_cartones_unicos(cantidad, 1, seed)

    datos = {
        "version": "1.0",
        "paquete_id": paquete_id,
        "nombre": nombre,
        "fecha_generacion": datetime.now().isoformat(),
        "total_cartones": len(cartones),
        "descripcion": f"Paquete {nombre} - {len(cartones)} cartones únicos de Bingo Carabobo",
        "cartones": cartones
    }

    return datos


def main():
    print("=" * 70)
    print("🎱 GENERADOR DE PAQUETES DE CARTONES BINGO 75")
    print("=" * 70)

    script_dir = Path(__file__).parent
    proyecto_dir = script_dir.parent
    paquetes_dir = proyecto_dir / "src" / "shared" / "constants" / "paquetes-cartones"

    paquetes_dir.mkdir(parents=True, exist_ok=True)

    paquetes = [
        {"nombre": "Paquete Alpha", "id": "paquete-alpha", "seed": 12345},
        {"nombre": "Paquete Beta", "id": "paquete-beta", "seed": 67890},
        {"nombre": "Paquete Gamma", "id": "paquete-gamma", "seed": 11111},
        {"nombre": "Paquete Delta", "id": "paquete-delta", "seed": 99999},
    ]

    print(f"\n📁 Directorio de paquetes: {paquetes_dir}")
    print(f"\n🎯 Se generarán {len(paquetes)} paquetes de 10,000 cartones cada uno")

    for i, paquete_info in enumerate(paquetes, 1):
        print(f"\n{'='*70}")
        print(f"Paquete {i}/{len(paquetes)}")
        print(f"{'='*70}")

        datos = crear_paquete(
            paquete_info["nombre"],
            paquete_info["id"],
            paquete_info["seed"]
        )

        archivo = paquetes_dir / f"{paquete_info['id']}.json"

        print(f"💾 Guardando {archivo.name}...")
        with open(archivo, 'w', encoding='utf-8') as f:
            json.dump(datos, f, ensure_ascii=False, indent=2)

        print(f"✅ Paquete guardado: {archivo.name}")

    print(f"\n{'='*70}")
    print("📦 Procesando paquete original...")
    print(f"{'='*70}")

    original_path = proyecto_dir / "src" / "shared" / "constants" / "cartones.json"
    nuevo_path = paquetes_dir / "paquete-original.json"

    if original_path.exists():
        with open(original_path, 'r', encoding='utf-8') as f:
            datos_original = json.load(f)

        datos_original["paquete_id"] = "paquete-original"
        datos_original["nombre"] = "Paquete Original"

        with open(nuevo_path, 'w', encoding='utf-8') as f:
            json.dump(datos_original, f, ensure_ascii=False, indent=2)

        print(f"✅ Paquete original copiado a: {nuevo_path.name}")

    print("\n" + "=" * 70)
    print("✅ PROCESO COMPLETADO")
    print("=" * 70)
    print(f"   • Total de paquetes: {len(paquetes) + 1}")
    print(f"   • Cartones por paquete: ~10,000")
    print(f"   • Directorio: {paquetes_dir}")
    print("=" * 70)


if __name__ == "__main__":
    main()
