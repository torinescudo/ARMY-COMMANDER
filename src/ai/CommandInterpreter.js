/**
 * ╔═══════════════════════════════════════════════╗
 * ║  CommandInterpreter - El Traductor de Órdenes  ║
 * ╚═══════════════════════════════════════════════╝
 *
 * Converts the parsed words of the living
 * into actions that move the dead.
 */

const Logger = require('../utils/Logger');

class CommandInterpreter {
  /**
   * Interpret parsed command into executable action
   */
  static interpret(parsed, gameState, battleId) {
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }

    const { intent, unitType, count, position, urgency } = parsed;

    switch (intent) {
      case 'send':
        return this.handleSend(unitType, count, position, urgency, gameState, battleId);
      case 'retreat':
        return { success: true, action: 'retreat', battle: battleId };
      case 'attack':
        return { success: true, action: 'attack', unitType, position, urgency };
      case 'defend':
        return { success: true, action: 'defend', position };
      default:
        return { success: false, error: `Orden desconocida: ${intent}` };
    }
  }

  /**
   * Handle send command — dispatch units into the abyss
   */
  static handleSend(unitType, count, position, urgency, gameState, battleId) {
    const inventory = gameState.shop.inventory;

    if (!inventory || inventory.length === 0) {
      return { success: false, error: 'Sin unidades en el inventario' };
    }

    let available = inventory;
    if (unitType) {
      available = inventory.filter(
        (u) => u.type.toLowerCase() === unitType.toLowerCase()
      );
    }

    if (available.length === 0) {
      return {
        success: false,
        error: `No hay ${unitType || ''} disponibles`,
      };
    }

    const toSend = available.slice(0, Math.min(count, available.length));
    const distanceMultiplier = this.getDistanceMultiplier(position);

    return {
      success: true,
      action: 'send',
      units: toSend,
      battleId,
      position,
      distance: distanceMultiplier,
      urgency,
      count: toSend.length,
    };
  }

  static getDistanceMultiplier(position) {
    const map = {
      center: 0,
      front: 1,
      back: 5,
      left: 3,
      right: 3,
      flank: 4,
      top: 4,
      bottom: 2,
    };
    return map[position] || 1;
  }

  /**
   * Validate action before execution
   * FIX: forEach return bug — use for...of + early return
   */
  static validate(action, gameState) {
    if (!action.success) {
      return { valid: false, error: action.error };
    }

    if (action.action === 'send') {
      // Check battle exists
      if (!gameState.battles.find((b) => b.id === action.battleId)) {
        return { valid: false, error: `Batalla ${action.battleId} no encontrada` };
      }

      // Check all units exist in inventory
      for (const unit of action.units) {
        const found = gameState.shop.inventory.find((u) => u.id === unit.id);
        if (!found) {
          return { valid: false, error: `Unidad ${unit.name || unit.id} ya no está en inventario` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Execute validated action on game state
   */
  static execute(action, gameState) {
    if (!action.success) {
      return { success: false, error: action.error };
    }

    Logger.debug(`Ejecutando: ${action.action}`, { action: action.action });

    switch (action.action) {
      case 'send':
        gameState.sendUnitsToBattle(action.units, action.battleId, action.distance);
        return {
          success: true,
          message: `Enviadas ${action.count} unidad(es) al ${action.position || 'campo'}`,
        };

      case 'retreat':
        return { success: true, message: 'Orden de retirada emitida' };

      case 'attack':
        return { success: true, message: `Orden de ataque hacia ${action.position || 'el frente'}` };

      case 'defend':
        return { success: true, message: `Defendiendo ${action.position || 'posición'}` };

      default:
        return { success: false, error: `Acción imposible: ${action.action}` };
    }
  }
}

module.exports = CommandInterpreter;
