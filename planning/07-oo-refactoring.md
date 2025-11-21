# Dice Object-Oriented Refactoring

## Goal

Refactor dice code to use a Dice class that encapsulates position, rotation, and all dice functionality in an object-oriented way.

## New Dice Class Structure

### Dice Class Properties

- `x, y` - Position coordinates (center of dice)
- `size` - Dice size in pixels
- `value` - Current dice value (1-6)
- `graphics` - Phaser Graphics object for rendering
- `angle` - Current rotation angle in degrees
- `scene` - Reference to Phaser scene

### Dice Class Methods

- `constructor(scene, x, y, size, initialValue)` - Initialize dice with position and value
- `render()` - Draw/update the dice face
- `setValue(value)` - Update dice value and re-render
- `setPosition(x, y)` - Update position coordinates
- `setAngle(angle)` - Update rotation angle
- `roll()` - Generate random value and update
- `updateFace()` - Redraw the dice face with current value

## Implementation Steps

### Step 1: Create Dice Class in dice.js

1. Create `class Dice` with constructor
2. Add all properties (x, y, size, value, graphics, angle, scene)
3. Initialize graphics object in constructor
4. Set position and create initial render

### Step 2: Move Rendering Logic into Dice Class

1. Move `drawDiceBase()` logic into Dice class (private method or internal)
2. Move `drawDots()` logic into Dice class
3. Create `render()` method that calls drawing methods
4. Create `updateFace()` method that clears and re-renders

### Step 3: Add Position and Rotation Methods

1. Implement `setPosition(x, y)` - updates graphics position
2. Implement `setAngle(angle)` - updates graphics angle
3. Ensure position is always the center of the dice
4. Store x, y as center coordinates

### Step 4: Update game.js to Use Dice Instances

1. Change `dice` array to store Dice instances instead of graphics objects
2. Update `initializeDice()` to create new Dice objects
3. Update all references from graphics properties to Dice methods
4. Remove direct graphics property access

### Step 5: Update rollAllDice Function

1. Change dice.forEach to work with Dice objects
2. Use `dice.setValue()` instead of `updateDiceFace()`
3. Use `dice.setAngle()` for rotation
4. Use `dice.setPosition()` if needed for animations
5. Access `dice.graphics` for Phaser tweens if needed

### Step 6: Clean Up Helper Functions

1. Keep `getDotPattern()` as utility function (used by Dice class)
2. Keep `rollDice()` as utility function or move to Dice class
3. Remove or deprecate `createDiceFace()` and `updateDiceFace()` functions
4. Update exports if using modules

## Code Structure Example

```javascript
class Dice {
  constructor(scene, x, y, size = 80, initialValue = 1) {
    this.scene = scene;
    this.x = x; // Center X
    this.y = y; // Center Y
    this.size = size;
    this.value = Math.max(1, Math.min(6, Math.floor(initialValue)));
    this.angle = 0;

    // Create graphics object
    this.graphics = scene.add.graphics();
    this.graphics.setPosition(this.x, this.y);

    // Initial render
    this.render();
  }

  render() {
    this.graphics.clear();
    const pattern = getDotPattern(this.value);
    this.drawBase();
    this.drawDots(pattern);
  }

  setValue(value) {
    this.value = Math.max(1, Math.min(6, Math.floor(value)));
    this.render();
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.graphics.setPosition(x, y);
  }

  setAngle(angle) {
    this.angle = angle;
    this.graphics.setAngle(angle);
  }

  roll() {
    this.setValue(Math.floor(Math.random() * 6) + 1);
  }

  // Private drawing methods
  drawBase() {
    /* ... */
  }
  drawDots(pattern) {
    /* ... */
  }
}
```

## Benefits

- **Better encapsulation**: Each die manages its own state
- **Cleaner code**: Clear separation of concerns
- **Easier to extend**: Can add methods like `animate()`, `highlight()`, etc.
- **Type safety**: Clear interface for dice operations
- **Reusability**: Dice class can be used in other games

## Testing Checklist

- [ ] Dice display correctly on initialization
- [ ] Dice can be positioned correctly
- [ ] Dice rotate around their own center
- [ ] Rolling updates dice values
- [ ] All 5 dice work independently
- [ ] Roll animation works with new structure
- [ ] No console errors
