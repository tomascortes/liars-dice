// Dice Game
// Displays 5 random dice that can be rolled

const config = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',

  backgroundColor: '#2c3e50',
  scene: {
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

// Game variables
let dice = []; // Array to store 5 Dice instances
let rollButton;
let isRolling = false;
let diceSize = 40;
let diceCount = 5;
let diceCountText;
const MIN_DICE = 1;
const MAX_DICE = 10;
let selectedValue = null; // Selected dice value for counting (1-6)
let valueSelectorButtons = []; // Array of value selector button objects

function create() {
  const scene = this;


  // Initialize 5 dice with random values
  initializeDice(scene);

  // Create roll button
  createRollButton(scene);

  // Create dice value selector
  createValueSelector(scene);

  // Create dice controls
  createDiceControls(scene);

}

function initializeDice(scene) {
  // Clear existing dice
  dice.forEach(die => die.destroy());
  dice = [];

  const startX = 225 - ((diceCount * diceSize + (diceCount - 1) * 20) / 2) + diceSize / 2;
  const y = 280; // Positioned for 450x630 canvas

  for (let i = 0; i < diceCount; i++) {
    const centerX = startX + i * (diceSize + 20);
    const centerY = y;
    const value = rollDice();
    // Create Dice instance at center position
    const die = new Dice(scene, centerX, centerY, diceSize, value, config);
    dice.push(die);
  }
}

function createRollButton(scene) {
  // Create button background
  const buttonBg = scene.add.graphics();
  buttonBg.fillStyle(0x3498db, 1);
  buttonBg.fillRoundedRect(125, 500, 200, 60, 10); // Centered for 450px width
  buttonBg.lineStyle(3, 0x2980b9, 1);
  buttonBg.strokeRoundedRect(125, 500, 200, 60, 10);

  // Button text
  const buttonText = scene.add.text(225, 530, 'ROLL DICE', { // Centered for 450px width
    fontSize: '28px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    align: 'center',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // Make button interactive
  buttonBg.setInteractive(new Phaser.Geom.Rectangle(125, 500, 200, 60), Phaser.Geom.Rectangle.Contains);
  buttonBg.on('pointerdown', () => {
    if (!isRolling) {
      rollAllDice(scene);
    }
  });
  buttonBg.on('pointerover', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x5dade2, 1);
    buttonBg.fillRoundedRect(125, 500, 200, 60, 10);
    buttonBg.lineStyle(3, 0x3498db, 1);
    buttonBg.strokeRoundedRect(125, 500, 200, 60, 10);
  });
  buttonBg.on('pointerout', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x3498db, 1);
    buttonBg.fillRoundedRect(125, 500, 200, 60, 10);
    buttonBg.lineStyle(3, 0x2980b9, 1);
    buttonBg.strokeRoundedRect(125, 500, 200, 60, 10);
  });

  rollButton = { bg: buttonBg, text: buttonText };
}

function createValueSelector(scene) {
  const y = 80;
  const buttonSize = 45;
  const spacing = 10;
  const totalWidth = (buttonSize * 6) + (spacing * 5);
  const startX = 225 - totalWidth / 2;

  // Title text
  scene.add.text(225, 40, 'Select Dice Value:', {
    fontSize: '18px',
    fontFamily: 'Arial, sans-serif',
    color: '#ecf0f1',
    align: 'center'
  }).setOrigin(0.5);

  // Create 6 buttons for each dice value
  for (let value = 1; value <= 6; value++) {
    const x = startX + (value - 1) * (buttonSize + spacing) + buttonSize / 2;

    const bg = scene.add.graphics();
    const text = scene.add.text(x, y, value.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const drawButton = (isSelected) => {
      bg.clear();
      if (isSelected) {
        bg.fillStyle(0x27ae60, 1); // Green when selected
        bg.fillCircle(x, y, buttonSize / 2);
        bg.lineStyle(3, 0x1e8449, 1);
      } else {
        bg.fillStyle(0x7f8c8d, 1); // Gray when not selected
        bg.fillCircle(x, y, buttonSize / 2);
        bg.lineStyle(2, 0xffffff, 0.5);
      }
      bg.strokeCircle(x, y, buttonSize / 2);
    };

    drawButton(false);

    bg.setInteractive(
      new Phaser.Geom.Circle(x, y, buttonSize / 2),
      Phaser.Geom.Circle.Contains
    );

    bg.on('pointerdown', () => {
      // Toggle selection - if already selected, deselect
      if (selectedValue === value) {
        selectedValue = null;
        clearCountResults();
        // Redraw all buttons to show none selected
        valueSelectorButtons.forEach((btn) => {
          btn.draw(false);
        });
      } else {
        // Select new value
        selectedValue = value;

        // Redraw all buttons to reflect selection
        valueSelectorButtons.forEach((btn, idx) => {
          btn.draw(idx + 1 === selectedValue);
        });

        // Automatically perform count when selecting
        performCount();
      }
    });

    bg.on('pointerover', () => {
      if (selectedValue !== value) {
        bg.clear();
        bg.fillStyle(0x95a5a6, 1);
        bg.fillCircle(x, y, buttonSize / 2);
        bg.lineStyle(2, 0xffffff, 0.5);
        bg.strokeCircle(x, y, buttonSize / 2);
      }
    });

    bg.on('pointerout', () => {
      drawButton(selectedValue === value);
    });

    valueSelectorButtons.push({ bg, text, draw: drawButton, value });
  }
}

function createDiceControls(scene) {
  const y = 595; // Positioned for 630px height
  const spacing = 60;
  const centerX = 225;

  // Dice count display
  diceCountText = scene.add.text(centerX, y, `Dice: ${diceCount}`, {
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    color: '#ecf0f1',
    align: 'center'
  }).setOrigin(0.5);

  // Minus button
  const minusBtn = createControlButton(scene, centerX - spacing * 1.5, y, '-', () => {
    if (diceCount > MIN_DICE) {
      diceCount--;
      updateDiceCount(scene);
    }
  });

  // Plus button
  const plusBtn = createControlButton(scene, centerX + spacing * 1.5, y, '+', () => {
    if (diceCount < MAX_DICE) {
      diceCount++;
      updateDiceCount(scene);
    }
  });
}

function createControlButton(scene, x, y, label, callback) {
  const size = 40;
  const bg = scene.add.graphics();

  const drawButton = (color) => {
    bg.clear();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);
  };

  drawButton(0x7f8c8d);

  const text = scene.add.text(x, y, label, {
    fontSize: '28px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  bg.setInteractive(new Phaser.Geom.Rectangle(x - size / 2, y - size / 2, size, size), Phaser.Geom.Rectangle.Contains);

  bg.on('pointerdown', callback);

  bg.on('pointerover', () => drawButton(0x95a5a6));
  bg.on('pointerout', () => drawButton(0x7f8c8d));

  return { bg, text };
}

function updateDiceCount(scene) {
  diceCountText.setText(`Dice: ${diceCount}`);
  initializeDice(scene);
  // If a value is selected, re-perform count after dice re-initialization
  if (selectedValue !== null) {
    performCount();
  }
}

function rollAllDice(scene) {
  if (isRolling) return;

  // Clear count results and highlights when rolling
  clearCountResults();

  isRolling = true;
  playDiceClick(scene, 0.4); // Initial roll click

  // Start roll for all dice
  dice.forEach((die) => {
    die.startRoll();
  });

  // Get roll configuration from first die (all dice share same config)
  const maxRolls = dice[0].maxRolls;
  const rollInterval = dice[0].rollInterval;

  // Roll animation timer
  let rollCount = 0;
  const rollTimer = scene.time.addEvent({
    delay: rollInterval,
    callback: () => {
      rollCount++;

      // Play click sounds during roll (every few frames for clattering effect)
      if (rollCount % 3 === 0) {
        playDiceClick(scene, 0.15 + Math.random() * 0.1); // Varied intensity clicks
      }

      // Update all dice for this roll step
      dice.forEach((die) => {
        die.updateRollStep(rollCount);
      });

      // Check if we've reached the final roll
      if (rollCount >= maxRolls) {
        // Final roll - settle all dice
        dice.forEach((die, index) => {
          die.settle(() => {
            // Last die to settle triggers completion
            if (index === dice.length - 1) {
              isRolling = false;
              playDiceClick(scene, 0.25); // Final settle click
              // Automatically perform count if a value is selected
              if (selectedValue !== null) {
                performCount();
              }
            }
          });
        });

        rollTimer.remove();
        return; // Exit early to prevent further execution
      }
    },
    repeat: maxRolls - 1
  });
}

function update() {
  // Game loop - no continuous updates needed for dice game
}

function playDiceClick(scene, intensity = 0.3) {
  const audioContext = scene.sound.context;

  // Create a buffer source with noise for a more realistic dice click
  const bufferSize = audioContext.sampleRate * 0.01; // 10ms of audio
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill with filtered noise (more click-like than pure white noise)
  for (let i = 0; i < bufferSize; i++) {
    // Create a percussive click with some randomness
    const t = i / bufferSize;
    const decay = Math.pow(1 - t, 2); // Exponential decay
    const noise = (Math.random() * 2 - 1) * decay;
    data[i] = noise * intensity;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Quick fade out for clean click
  gainNode.gain.setValueAtTime(intensity, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.01);

  source.start(audioContext.currentTime);
  source.stop(audioContext.currentTime + 0.01);
}

/**
 * Count dice by value following Liar's Dice rules
 * 1s are wildcards and count toward any selected value
 */
function countDiceByValue(targetValue) {
  let count = 0;
  let matchingIndices = [];

  dice.forEach((die, index) => {
    // Liar's Dice rules: 1s are wildcards (comodines)
    // BUT when counting 1s specifically, only count actual 1s
    if (targetValue === 1) {
      // When looking for 1s, only count 1s
      if (die.value === 1) {
        count++;
        matchingIndices.push(index);
      }
    } else {
      // When looking for other values, 1s count as wildcards
      if (die.value === targetValue || die.value === 1) {
        count++;
        matchingIndices.push(index);
      }
    }
  });

  return { count, matchingIndices };
}

/**
 * Perform the count operation and update UI
 */
function performCount() {
  if (selectedValue === null) return;

  const result = countDiceByValue(selectedValue);

  // Highlight matching dice (no text display)
  dice.forEach((die, index) => {
    if (result.matchingIndices.includes(index)) {
      die.setHighlight(true);
    } else {
      die.setHighlight(false);
    }
  });
}

/**
 * Clear count results and remove highlights
 */
function clearCountResults() {
  // Remove all highlights
  dice.forEach(die => {
    die.setHighlight(false);
  });
}
