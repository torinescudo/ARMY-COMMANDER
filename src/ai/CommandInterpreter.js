/**
 * CommandInterpreter - converts parsed NL commands into game actions
 */

const Logger = require('../utils/Logger');

class CommandInterpreter {
  /**
   * Interpret parsed command and return executable action
   */
  static interpret(parsed, gameState, battleId) {
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error,
      };
    }

    const { intent, unitType, count, position, urgency } = parsed;

    switch (intent) {
      case 'send':
        return this.handleSend(unitType, count, position, urgency, gameState, battleId);

      case 'retreat':
        return {
          success: true,
          action: 'retreat',
          battle: battleId,
        };

      case 'attack':
        return {
          success: true,
          action: 'attack',
          unitType,
          position,
          urgency,
        };

      case 'defend':
        return {
          success: true,
          action: 'defend',
          position,
        };

      default:
        return {
          success: false,
          error: `Unknown intent: ${intent}`,
        };
    }
  }

  /**
   * Handle send command specifically
   */
  static handleSend(unitType, count, position, urgency, gameState, battleId) {
    // Find available units matching type
    const inventory = gameState.shop.inventory;

    if (!inventory || inventory.length === 0) {
      return {
        success: false,
        error: 'No units available in inventory',
      };
    }

    // Filter by unit type if specified
    let available = inventory;
    if (unitType) {
      available = inventory.filter(
        (u) => u.type.toLowerCase() === unitType.toLowerCase()
      );
    }

    if (available.length === 0) {
      return {
        success: false,
        error: `No ${unitType || 'available'} units in inventory`,
      };
    }

    // Take up to count units (or fewer if not enough)
    const toSend = available.slice(0, Math.min(count, available.length));

    // Determine travel distance (affects arrival time)
    // Position further away = more delay
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

  /**
   * Get distance multiplier based on position
   * Central positions arrive faster, flanks slower
   */
  static getDistanceMultiplier(position) {
    const distanceMap = {
      center: 0, // No delay
      front: 1,
      back: 5,
      left: 3,
      right: 3,
      flank: 4,
      top: 4,
      bottom: 4,
      null: 1, // Default
      undefined: 1,
    };

    return distanceMap[position] || 1;
  }

  /**
   * Validate action before execution
   */
  static validate(action, gameState) {
    if (!action.success) {
      return {
        valid: false,
        error: action.error,
      };
    }

    switch (action.action) {
      case 'send':
        // Check if battle exists
        if (!gameState.battles.find((b) => b.id === action.battleId)) {
          return {
            valid: false,
            error: `Battle ${action.battleId} not found`,
          };
        }

        // Check if units exist in inventory
        action.units.forEach((unit) => {
          const found = gameState.shop.inventory.find((u) => u.id === unit.id);
          if (!found) {
            return {
              valid: false,
              error: `Unit ${unit.id} not in inventory`,
            };
          }
        });

        return { valid: true };

      case 'retreat':
      case 'attack':
      case 'defend':
        return { valid: true };

      default:
        return {
          valid: false,
          error: `Unknown action: ${action.action}`,
        };
    }
  }

  /**
   * Execute validated action on game state
   */
  static execute(action, gameState) {
    if (!action.success) {
      return {
        success: false,
        error: action.error,
      };
    }

    Logger.debug(`Executing action: ${action.action}`, { action });

    switch (action.action) {
      case 'send':
        gameState.sendUnitsToBattle(
          action.units,
          action.battleId,
          action.distance
        );

        return {
          success: true,
          message: `Sent ${action.count} unit(s) to ${action.position || 'battle'}`,
        };

      case 'retreat':
        // TODO: Implement retreat logic
        return {
          success: true,
          message: 'Retreat command issued',
        };

      case 'attack':
        return {
          success: true,
          message: `Attack command issued toward ${action.position}`,
        };

      case 'defend':
        return {
          success: true,
          message: `Defending ${action.position}`,
        };

      default:
        return {
          success: false,
          error: `Cannot execute action: ${action.action}`,
        };
    }
  }

  /**
   * Full pipeline: parse → validate → execute
   */
  static process(text, gameState, battleId) {
    // This is handled by the game, but here's the full flow for reference:
    // 1. NLProcessor.parseCommand(text)
    // 2. CommandInterpreter.interpret(parsed, gameState, battleId)
    // 3. CommandInterpreter.validate(action, gameState)
    // 4. CommandInterpreter.execute(action, gameState)
  }
}

module.exports = CommandInterpreter;
