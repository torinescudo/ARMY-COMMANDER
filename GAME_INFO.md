# ⚰ ARMY COMMANDER
### Game Worms Studio · v0.1.0

---

## Descripción

**Army Commander** es un juego RTS/Roguelike híbrido con estética gótica oscura. Juegas como un comandante supremo que gestiona múltiples batallas simultáneas desde una interfaz que simula terminales de mando militar.

El juego combina:
- **RTS** — Gestión en tiempo real de unidades, recursos y múltiples frentes de batalla
- **Roguelike** — Muerte permanente, runs con semilla, progresión por oleadas
- **Procesamiento de lenguaje natural** — Das órdenes escribiendo en español o inglés

---

## Cómo Jugar

### Arrancar el juego

```bash
# Versión web (recomendada)
npm start
# Abre http://localhost:3000 en tu navegador

# Versión terminal clásica (blessed)
npm run terminal
```

### Flujo del juego

1. **Intro** — Pantalla de inicio con logo de Game Worms y menú
2. **Hub** — Selecciona tu comandante, compra unidades en la tienda
3. **Batalla** — Las grietas dimensionales se abren automáticamente. Envía unidades y da órdenes
4. **Fin** — Cuando el estrés llega a 100, la partida termina

### Controles

| Tecla | Acción |
|-------|--------|
| `1-5` | Comprar unidad de la tienda (Hub) / Cambiar pestaña de batalla |
| `R` | Reinvocar comandante (Hub) |
| `Tab` | Siguiente batalla |
| `Enter` | Enviar orden en el chat |
| `N` | Nueva partida (Intro/Fin) |
| `X` | Salir |

### Órdenes por chat (lenguaje natural)

```
"envía 3 infantería"
"send 5 archers to the left"
"manda caballería al frente"
"defiende el centro"
"retira las unidades"
```

Soporta español e inglés. Detecta: intención, tipo de unidad, cantidad, posición, urgencia.

---

## Mecánicas Principales

### Estrés (0-100)
La mecánica central. El estrés sube cuando:
- Se abre una nueva batalla (+2)
- Enemigos alcanzan la base (+5)
- Un comandante cae (+10)
- No respondes a los mensajes de tus comandantes (+1 cada 3s)

Baja cuando:
- Completas una oleada (-5)
- Ganas una batalla (-15)

**Estrés = 100 → Game Over.**

### Oro Maldito
- Se genera automáticamente (+0.5/s)
- Se gana por completar oleadas y victorias
- Se gasta en comprar unidades en la tienda

### Comandantes
Generados proceduralmente con:
- Nombre gótico (ej: "Krath el Maldito", "Vex el Eterno")
- Rasgos únicos (Estratega, Brutal, Maldito, Cauteloso...)
- Estadísticas: Salud, Moral, Liderazgo

### Unidades

| Tipo | HP | DMG | SPD | RNG | Símbolo |
|------|----|-----|-----|-----|---------|
| Infantería | 10 | 3 | 2 | 2 | [I] |
| Arquero | 5 | 8 | 4 | 6 | [A] |
| Caballería | 12 | 5 | 5 | 2 | [C] |
| Mago | 3 | 12 | 2 | 7 | [M] |
| No-muerto | 15 | 4 | 1 | 2 | [U] |

### Batallas
- Máximo 5 simultáneas
- 10 oleadas por batalla
- Enemigos escalan en HP y daño por oleada (cap en oleada 20)
- Las unidades enviadas tardan en llegar (mecánica de distancia)
- Si el comandante de la batalla muere, la batalla se pierde

---

## Arquitectura Técnica

### Versión Web (actual)
```
server.js                    → Express + WebSocket
src/server/GameEngine.js     → Motor de juego headless
public/
  index.html                 → Estructura HTML
  css/terminal.css           → Estética terminal
  js/app.js                  → Cliente WebSocket + rendering
```

### Versión Terminal (legacy)
```
main.js                      → Entrada blessed
src/core/Game.js             → Motor + UI blessed
src/ui/*.js                  → Pantallas blessed
```

### Core (compartido)
```
src/core/
  Battle.js                  → Lógica de batalla
  Commander.js               → Entidad comandante
  Unit.js                    → Entidad unidad
  Enemy.js                   → Entidad enemigo
  Shop.js                    → Tienda y economía
  Stress.js                  → Sistema de estrés
  Run.js                     → Tracking de partida

src/ai/
  NLProcessor.js             → Procesamiento lenguaje natural
  CommandInterpreter.js      → Interpreta → valida → ejecuta
  TargetingAI.js             → Selección de objetivos
  CommanderAI.js             → Posicionamiento de unidades
  EnemyAI.js                 → Comportamiento enemigo

src/generation/
  CommanderGenerator.js      → Genera comandantes procedurales
  EnemyWaveGenerator.js      → Genera oleadas de enemigos
  CommanderMessageGenerator.js → Genera diálogos del comandante
  UnitGenerator.js           → Genera unidades
  NameGenerator.js           → Genera nombres góticos

src/utils/
  Constants.js               → Configuración del juego
  Random.js                  → Random con semilla (reproducible)
  Logger.js                  → Log a archivo (no stdout)
```

### Protocolo WebSocket

**Servidor → Cliente:**
```json
{ "type": "state", "data": { "mode": "intro|hub|battle|end", ... } }
{ "type": "chat", "data": [{ "speaker": "...", "text": "...", "type": "..." }] }
```

**Cliente → Servidor:**
```json
{ "type": "start_game" }
{ "type": "command", "text": "envía 3 infantería" }
{ "type": "buy_unit", "unitId": "abc123" }
{ "type": "reroll" }
{ "type": "switch_tab", "index": 0 }
{ "type": "restart" }
```

---

## Stack

- **Runtime:** Node.js
- **Backend:** Express + ws (WebSocket)
- **Frontend:** HTML/CSS/JS vanilla (estética terminal)
- **Terminal (legacy):** blessed
- **IDs:** nanoid

---

## Dev

```bash
npm start           # Servidor web en localhost:3000
npm run terminal    # Versión terminal clásica
npm run dev         # Dev runner con logs
npm run dev:debug   # Modo debug
npm run dev:watch   # Reinicio automático al editar
```

---

*Game Worms Studio — "En el abismo, cada orden es un pacto con la muerte"*
