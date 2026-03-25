# ARMY COMMANDER - Phases 2-5 Implementation Plan
## Battle System + Chat + Polish + Full Roguelike Progression

**Created**: 2026-03-25
**Strategy**: Battle + Chat first (Phases 2+3), then Polish & Roguelike (Phases 4+5)

---

## User Decisions Locked In

### Architecture Choices
- **Multi-Battle UI**: All tabs open in parallel, visual alerts for urgent battles, timing affects unit arrival
- **Combat System**: Type-aware targeting (Infantry→Infantry, Archers→high-priority)
- **Commander Traits**: Drive AI positioning and tactical decisions
- **NL Parsing**: Pre-trained small offline ML model (TinyBERT/OnnxJS) for free-form command understanding
- **Chat Model**: Async chat (commander sends requests continuously, you respond via `/send`)
- **Implementation Order**: Battle system → Chat integration → Polish → Roguelike progression

---

## PHASE 2: Battle System & RTS Autobattle

### Objectives
1. Create Battle class and BattleScreen
2. Implement enemy wave generation and spawn mechanics
3. Build RTS autobattle with type-aware targeting
4. Create multi-tab system (TAB key to switch, numeric keys to focus)
5. Integrate timing/distance mechanics (units slow to reach far tabs)
6. Display battle map with ASCII units/enemies
7. Implement wave completion and stress changes

### New Files to Create

#### Core Battle Classes
- `src/core/Battle.js` - Manages single battle state (units, enemies, wave count, etc.)
- `src/core/Enemy.js` - Enemy unit class (similar to Unit but hostile)
- `src/generation/EnemyWaveGenerator.js` - Procedural enemy wave composition
- `src/ai/TargetingAI.js` - Type-aware targeting logic

#### Battle UI
- `src/ui/BattleScreen.js` - Display single battle (map, units, enemies, wave info)
- `src/ui/TabManager.js` - Manages multiple open battle tabs, handles switching
- `src/ui/BattleMap.js` - Renders ASCII map with unit/enemy positions

#### AI Systems
- `src/ai/CommanderAI.js` - Commander positioning based on traits
- `src/ai/EnemyAI.js` - Enemy movement toward player base

### Implementation Details

#### Battle.js Structure
```javascript
class Battle {
  constructor(commanderId, battleId, waveCount = 10) {
    this.id = battleId
    this.commander = commander // Loaded from game
    this.friendlyUnits = [] // Units player sent
    this.enemies = [] // Current wave enemies
    this.currentWave = 1
    this.maxWaves = waveCount
    this.mapWidth = 60
    this.mapHeight = 12
    this.stressChange = 0
    this.goldReward = 0
    this.createdAt = Date.now()
  }

  spawn(units, position) { } // Add friendly units
  spawnWave() { } // Generate and spawn enemy wave
  update(deltaTime) { } // RTS tick: move, target, attack
  getMap() { } // Return grid for rendering
  isLost() { } // Check if enemies reached base
  isComplete() { } // Check if wave/battle won
}
```

#### EnemyWaveGenerator.js
```javascript
function generateWave(waveNumber) {
  const baseDifficulty = 1 + (waveNumber * 0.05)

  // Scale: wave 5 = +25% HP/DMG, wave 10 = +50%, etc.
  const composition = {
    infantry: Math.floor(3 + waveNumber * 0.3),
    archers: Math.floor(1 + waveNumber * 0.2),
    cavalry: Math.floor(0 + waveNumber * 0.1),
  }

  return generateEnemies(composition, baseDifficulty)
}
```

#### TargetingAI.js
Type-aware logic:
- **Infantry** targets nearest **Infantry** or weak units
- **Archers** target highest-damage enemies first (priority)
- **Cavalry** charge closest enemies
- **Mages** focus on groups/high-threat
- **Undead** target anything (no preference)

```javascript
function chooseTarget(unit, enemies) {
  if (unit.type === 'Archer') {
    return enemies
      .filter(e => inRange(unit, e))
      .sort((a, b) => b.damage - a.damage)[0]
  }
  // Similar logic per type...
}
```

#### BattleScreen.js
```javascript
class BattleScreen extends Screen {
  create() {
    // Header: Battle ID, Wave, Stress, Commander health
    // Map: ASCII grid with:
    //   [S] = soldiers
    //   [A] = archers
    //   [C] = cavalry
    //   @ = enemies
    //   ★ = flying enemies
    //   ▔▔ = player base
    // Footer: Unit count, Wave progress, Send controls
  }

  update(battleState) { }
}
```

#### TabManager.js
```javascript
class TabManager {
  constructor(renderer) {
    this.battles = [] // Active Battle objects
    this.currentTabIndex = 0
    this.renderer = renderer
  }

  addBattle(battle) { }
  switchTab(index) { } // TAB key or numeric 1/2/3
  getActiveBattle() { }
  updateAllTabs() { }
  render() { } // Show all active tabs
}
```

### Game Loop Integration

Update `Game.js`:
```javascript
update(deltaTime) {
  this.shop.updateGold(deltaTime)

  // Update all active battles in parallel
  this.battles.forEach(battle => {
    battle.update(deltaTime)

    if (battle.isLost()) {
      this.stress.add(10, 'battle_lost')
      this.closeBattle(battle.id)
    }

    if (battle.isComplete()) {
      const reward = battle.goldReward
      this.shop.addGold(reward)
      this.stress.reduce(15, 'battle_won')
      this.keepBattle(battle.id) // Option to reuse commander
    }
  })

  // Randomly spawn new battles
  if (Math.random() < this.getNewBattleChance()) {
    this.openNewBattle()
  }
}
```

### Stress System Integration
- `-5` per wave completed
- `+1/sec` if chat request unanswered
- `+5` per enemy reaching base
- `+2` per new battle opened
- `+10` if battle lost (commander dies)
- `-15` if battle fully won

---

## PHASE 3: Natural Language Chat & Commander Interaction

### Objectives
1. Integrate small offline ML model (TinyBERT via ONNX.js)
2. Parse commander chat requests for unit types, positions, urgency
3. Create ChatPanel UI for message history
4. Implement stress decay for ignoring requests
5. Auto-parse `/send` commands and natural language alternatives
6. Generate contextual commander messages based on battle state

### New Files to Create

#### NL Processing
- `src/ai/NLProcessor.js` - Main NL parser using small ML model
- `src/ai/CommandInterpreter.js` - Converts parsed NL to game actions
- `src/utils/CommandValidator.js` - Validates unit selections, positions

#### Chat UI
- `src/ui/ChatPanel.js` - Message history, input field
- `src/ui/CommanderMessage.js` - Format commander messages with urgency

#### Commander Logic
- `src/generation/CommanderMessageGenerator.js` - Context-aware message generation

### Implementation Details

#### NLProcessor.js with TinyBERT
```javascript
const ort = require('onnxruntime-web')

class NLProcessor {
  constructor() {
    // Load TinyBERT model (distilled BERT, ~30MB)
    this.model = null
    this.tokenizer = null
    this.initialize()
  }

  async initialize() {
    // Load ONNX model from file
    this.model = await ort.InferenceSession.create('./models/tinybert.onnx')
  }

  parseCommand(text) {
    // Tokenize input
    const tokens = this.tokenizer.encode(text)

    // Run inference
    const output = this.model.run(tokens)

    // Extract: intent, unitType, position, urgency
    return {
      intent: output.intent, // 'send', 'retreat', 'attack'
      unitType: output.unitType, // 'infantry', 'archer', etc.
      position: output.position, // 'left', 'right', 'center', etc.
      urgency: output.urgency, // 0-1 confidence
      raw: text,
    }
  }
}
```

#### CommandInterpreter.js
```javascript
function interpretParsedCommand(parsed, gameState) {
  const { intent, unitType, position, urgency } = parsed

  // Find matching units in inventory
  const available = gameState.shop.inventory
    .filter(u => matches(u, unitType))

  if (!available.length) {
    return {
      success: false,
      error: `No ${unitType} units available`,
    }
  }

  // Determine target battle/position
  const targetBattle = determineTarget(position, gameState.battles)

  return {
    success: true,
    action: 'send',
    units: available.slice(0, urgency > 0.8 ? 3 : 1),
    targetBattle,
    position,
  }
}
```

#### ChatPanel.js
```javascript
class ChatPanel extends Screen {
  constructor(renderer) {
    super(renderer)
    this.messages = [] // { speaker, text, timestamp, urgency }
    this.inputField = null
  }

  create() {
    // Message history box
    this.elements.history = this.renderer.createBox({
      top: 0,
      left: 0,
      width: '100%',
      height: '80%',
      scrollable: true,
      border: 'line',
      label: ' CHAT ',
    })

    // Input field
    this.elements.input = this.renderer.createBox({
      top: '80%',
      left: 0,
      width: '100%',
      height: '20%',
      border: 'line',
      focusable: true,
    })
  }

  addMessage(speaker, text, urgency = 0.5) {
    this.messages.push({
      speaker,
      text,
      urgency,
      timestamp: Date.now(),
    })
    this.updateHistory()
  }

  updateHistory() {
    let content = ''
    this.messages.slice(-20).forEach(msg => {
      const color = msg.urgency > 0.7 ? 'red' : 'cyan'
      content += `[${msg.speaker}] ${msg.text}\n`
    })
    this.elements.history.setContent(content)
  }
}
```

#### CommanderMessageGenerator.js
Context-aware messages based on:
- Current wave difficulty
- Unit availability
- Commander morale
- Traits (Brutal = aggressive demands, Leal = polite requests)

```javascript
function generateMessage(battle, commander) {
  const wave = battle.currentWave
  const difficulty = wave / battle.maxWaves

  const templates = {
    Brutal: [
      "¡Necesito refuerzos AHORA o caemos!",
      "¡Soldados! ¡A la carga!",
    ],
    Leal: [
      "¿Podrías enviar apoyo cuando puedas?",
      "Resistiremos, pero necesitamos ayuda...",
    ],
  }

  const trait = commander.traits[0]
  const pool = templates[trait] || templates.Leal
  return pickRandom(pool)
}
```

### Chat Integration with Battle Loop
```javascript
updateBattle(deltaTime) {
  // If no message from commander recently, generate one
  if (Date.now() - this.lastMessageTime > 8000) {
    const msg = generateMessage(this)
    this.chatPanel.addMessage(this.commander.name, msg)
    this.lastMessageTime = Date.now()
  }

  // Monitor for unanswered requests
  if (this.pendingRequest && Date.now() - this.requestTime > 3000) {
    this.stress.add(1, 'unanswered_request')
  }
}
```

---

## PHASE 4: Polish & Roguelike Progression

### Objectives
1. Implement run progression (batches of waves)
2. Add enemy difficulty scaling per run
3. Create end-screen with stats summary
4. Add procedural battle names/themes
5. Implement unit variety in waves
6. Add visual polish (animations, colors, ASCII art)
7. Balance gold/cost economics

### New Files to Create

#### Run/Progression
- `src/core/Run.js` - Track run progress, waves, batches
- `src/generation/BattleGenerator.js` - Procedural battle names/scenarios
- `src/ui/EndScreen.js` - Game over summary

#### Balance/Config
- `src/utils/BalanceConstants.js` - Difficulty curves, cost adjustments
- `src/utils/Statistics.js` - Track player stats across runs

### Key Features

**Run Progression**
- Run starts when first battle opens
- After N waves completed, new battles spawn more frequently
- Difficulty increases per wave (+5% enemy stats every 2 waves)
- Run ends when stress ≥ 100

**Procedural Battle Themes**
```javascript
const battleThemes = [
  { name: 'Malditos Campos', description: 'Corrupted farmland' },
  { name: 'Puerta del Abismo', description: 'Gate to hell' },
  { name: 'Cementerio Profano', description: 'Desecrated graveyard' },
]
```

**End Screen**
```
╔════════════════════════════════╗
║  ⚰ GAME OVER ⚰                 ║
╠════════════════════════════════╣
║ Batallas Ganadas: 7            ║
║ Oleadas Completadas: 23        ║
║ Enemigos Derrotados: 342       ║
║ Oro Acumulado: 2,450g          ║
║ Unidades Perdidas: 5           ║
║                                ║
║ [NUEVA PARTIDA] [SALIR]        ║
╚════════════════════════════════╝
```

---

## PHASE 5: Advanced Features & Balance

### Objectives
1. Implement seed-based run reproducibility
2. Add persistent runs/save system (optional)
3. Complete natural language edge cases
4. Fine-tune difficulty curve
5. Add cosmetic unlocks/achievements
6. Performance optimization

### Features

**Run Seeds**
```javascript
function startNewRun(seed = null) {
  const runSeed = seed || Date.now()
  Random.setSeed(runSeed)
  // All generation now uses seeded RNG
}
```

**Achievements/Stats**
- Fastest battle clear
- Most units killed
- Lowest stress run
- Perfect wave (0 damage taken)

---

## Architecture Overview

### File Tree (Final)
```
army-commander/
├── src/
│   ├── core/
│   │   ├── Game.js
│   │   ├── Battle.js ⭐ NEW
│   │   ├── Enemy.js ⭐ NEW
│   │   ├── Commander.js
│   │   ├── Unit.js
│   │   ├── Shop.js
│   │   ├── Stress.js
│   │   └── Run.js ⭐ NEW (Phase 4)
│   │
│   ├── ui/
│   │   ├── Renderer.js
│   │   ├── Screen.js
│   │   ├── HubScreen.js
│   │   ├── BattleScreen.js ⭐ NEW
│   │   ├── TabManager.js ⭐ NEW
│   │   ├── BattleMap.js ⭐ NEW
│   │   ├── ChatPanel.js ⭐ NEW (Phase 3)
│   │   └── EndScreen.js ⭐ NEW (Phase 4)
│   │
│   ├── ai/
│   │   ├── TargetingAI.js ⭐ NEW
│   │   ├── CommanderAI.js ⭐ NEW
│   │   ├── EnemyAI.js ⭐ NEW
│   │   ├── NLProcessor.js ⭐ NEW (Phase 3)
│   │   └── CommandInterpreter.js ⭐ NEW (Phase 3)
│   │
│   ├── generation/
│   │   ├── NameGenerator.js
│   │   ├── CommanderGenerator.js
│   │   ├── UnitGenerator.js
│   │   ├── EnemyWaveGenerator.js ⭐ NEW
│   │   ├── CommanderMessageGenerator.js ⭐ NEW (Phase 3)
│   │   ├── BattleGenerator.js ⭐ NEW (Phase 4)
│   │
│   └── utils/
│       ├── Constants.js
│       ├── Random.js
│       ├── Logger.js
│       ├── CommandValidator.js ⭐ NEW (Phase 3)
│       ├── BalanceConstants.js ⭐ NEW (Phase 4)
│       └── Statistics.js ⭐ NEW (Phase 4)
│
├── models/ ⭐ NEW (Phase 3)
│   └── tinybert.onnx (pre-trained ML model)
│
├── main.js
├── package.json (+ onnxruntime, other deps)
└── .gitignore
```

---

## Dependency Changes

Add for Phase 3+:
```json
{
  "onnxruntime-web": "^1.16.0",  // ONNX.js for TinyBERT
  "natural": "^6.0.0",             // Tokenization fallback
  "lodash": "^4.17.21"             // Utility functions
}
```

---

## Implementation Roadmap

### Week 1: Phase 2 (Battle System)
- [ ] Battle.js + Enemy.js core
- [ ] EnemyWaveGenerator
- [ ] TargetingAI + positioning
- [ ] BattleScreen + TabManager
- [ ] Integrate into Game loop
- [ ] Test: spawn battle, watch waves, complete waves

### Week 2: Phase 3 (Chat + NL)
- [ ] Download TinyBERT model
- [ ] NLProcessor with ONNX
- [ ] ChatPanel UI
- [ ] CommanderMessageGenerator
- [ ] Integration: chat → battle updates
- [ ] Test: send units via NL, stress changes

### Week 3: Phase 4 (Polish + Progression)
- [ ] Run.js tracking
- [ ] BattleGenerator for variety
- [ ] EndScreen
- [ ] Difficulty scaling
- [ ] Balance tweaks
- [ ] Test: full run from HUB → Game Over

### Week 4: Phase 5 (Advanced)
- [ ] Seed system
- [ ] Achievements
- [ ] Performance optimization
- [ ] Final balance pass
- [ ] Ready for release

---

## Critical Success Metrics

✅ **Phase 2 Done When:**
- Battle spawns, enemy waves advance
- Player can send units to defend
- Units engage with type-aware targeting
- Waves complete, stress/gold update
- Multiple battles visible in tabs

✅ **Phase 3 Done When:**
- Commander sends chat messages
- NL parser understands "send 2 archers left"
- Chat history visible
- Stress increases if requests ignored

✅ **Phase 4 Done When:**
- Game starts at HUB, battles auto-spawn
- Run progresses through waves
- Difficulty increases over time
- Final screen shows stats
- Full game loop playable

✅ **Phase 5 Done When:**
- Seed-based reproducibility works
- All gameplay balanced
- No crashes or major bugs
- Roguelike progression feels fair

---

## Notes

- Keep game running at 60ms tick (~16.6 FPS)
- All generation functions use seeded RNG
- Stress is the core pressure mechanic—tune carefully
- Multi-tab system critical for mid/late game complexity
- NL model can be swapped or improved post-launch
- Dark goth aesthetic maintained throughout
