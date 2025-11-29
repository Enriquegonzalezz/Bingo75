"""
Script para generar 9000 cartones adicionales de Bingo 75.
Los cartones existentes van del 1 al 1000, este script genera del 1001 al 10000.
Cada cartón tiene números únicos del 1 al 75 distribuidos en columnas B, I, N, G, O.
"""

import json
import random
import uuid
from datetime import datetime
from pathlib import Path


def generar_carton(numero_carton: int) -> dict:
    """
    Genera un cartón de bingo válido.
    
    Reglas:
    - Columna B: números del 1-15 (5 números)
    - Columna I: números del 16-30 (5 números)
    - Columna N: números del 31-45 (5 números, centro es FREE = 0)
    - Columna G: números del 46-60 (5 números)
    - Columna O: números del 61-75 (5 números)
    """
    # Rangos para cada columna
    rangos = {
        'B': (1, 15),
        'I': (16, 30),
        'N': (31, 45),
        'G': (46, 60),
        'O': (61, 75)
    }
    
    numeros = {}
    
    for letra, (min_val, max_val) in rangos.items():
        # Seleccionar 5 números únicos del rango
        nums = random.sample(range(min_val, max_val + 1), 5)
        
        # Para la columna N, el centro (posición 2) es FREE (0)
        if letra == 'N':
            nums[2] = 0
        
        numeros[letra] = nums
    
    # Construir la matriz 5x5 (filas x columnas)
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
    
    # Generar ID único
    timestamp = int(datetime.now().timestamp())
    carton_id = f"carton-{timestamp}-{numero_carton}"
    
    return {
        "id": carton_id,
        "serial": "BINGO CARABOBO",
        "numero_carton": numero_carton,
        "numeros": numeros,
        "matriz": matriz
    }


def cargar_cartones_existentes(ruta: Path) -> dict:
    """Carga los cartones existentes del archivo JSON."""
    with open(ruta, 'r', encoding='utf-8') as f:
        return json.load(f)


def generar_cartones_unicos(cantidad: int, inicio: int) -> list:
    """
    Genera una cantidad específica de cartones únicos.
    Verifica que no haya cartones duplicados (misma matriz).
    """
    cartones = []
    matrices_vistas = set()
    
    intentos = 0
    max_intentos = cantidad * 10  # Límite de seguridad
    
    while len(cartones) < cantidad and intentos < max_intentos:
        numero_carton = inicio + len(cartones)
        carton = generar_carton(numero_carton)
        
        # Convertir matriz a tupla para poder usar como clave en set
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


def main():
    print("=" * 60)
    print("🎱 GENERADOR DE CARTONES BINGO 75")
    print("=" * 60)
    
    # Rutas
    script_dir = Path(__file__).parent
    proyecto_dir = script_dir.parent
    ruta_json = proyecto_dir / "src" / "shared" / "constants" / "cartones.json"
    
    print(f"\n📁 Archivo de cartones: {ruta_json}")
    
    # Cargar cartones existentes
    print("\n📖 Cargando cartones existentes...")
    datos_existentes = cargar_cartones_existentes(ruta_json)
    cartones_existentes = datos_existentes.get('cartones', [])
    
    print(f"   ✓ {len(cartones_existentes)} cartones existentes encontrados")
    
    # Verificar que hay 1000 cartones
    if len(cartones_existentes) != 1000:
        print(f"   ⚠️ Se esperaban 1000 cartones, se encontraron {len(cartones_existentes)}")
    
    # Generar 9000 cartones nuevos (del 1001 al 10000)
    print("\n🎲 Generando 9000 cartones nuevos...")
    nuevos_cartones = generar_cartones_unicos(9000, 1001)
    
    print(f"   ✓ {len(nuevos_cartones)} cartones nuevos generados")
    
    # Combinar cartones
    todos_cartones = cartones_existentes + nuevos_cartones
    
    print(f"\n📊 Total de cartones: {len(todos_cartones)}")
    
    # Crear nuevo objeto de datos
    nuevos_datos = {
        "version": "2.0",
        "fecha_generacion": datetime.now().isoformat(),
        "fecha_original": datos_existentes.get('fecha_migracion', ''),
        "total_cartones": len(todos_cartones),
        "descripcion": "10,000 cartones de Bingo Carabobo - 1000 originales + 9000 generados",
        "cartones": todos_cartones
    }
    
    # Guardar archivo
    print("\n💾 Guardando archivo...")
    
    # Crear backup del archivo original
    backup_path = ruta_json.with_suffix('.backup.json')
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(datos_existentes, f, ensure_ascii=False)
    print(f"   ✓ Backup creado: {backup_path.name}")
    
    # Guardar nuevo archivo
    with open(ruta_json, 'w', encoding='utf-8') as f:
        json.dump(nuevos_datos, f, ensure_ascii=False, indent=2)
    
    print(f"   ✓ Archivo actualizado: {ruta_json.name}")
    
    # Estadísticas finales
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)
    print(f"   • Cartones originales: 1,000 (1-1000)")
    print(f"   • Cartones nuevos: 9,000 (1001-10000)")
    print(f"   • Total: 10,000 cartones")
    print(f"   • Archivo: {ruta_json}")
    print("=" * 60)


if __name__ == "__main__":
    main()
