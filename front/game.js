// Dice Game
// Displays 5 random dice that can be rolled

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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

function create() {
  const scene = this;
  
  // Title
  this.add.text(400, 50, 'LIARS DICE GAME', {
    fontSize: '48px',
    fontFamily: 'Arial, sans-serif',
    color: '#ecf0f1',
    align: 'center',
    stroke: '#34495e',
    strokeThickness: 4
  }).setOrigin(0.5);
  
  // Initialize 5 dice with random values
  initializeDice(scene);
  
  // Create roll button
  createRollButton(scene);

  // Instructions
  this.add.text(400, 550, 'Click "ROLL DICE" to roll the dice', {
    fontSize: '18px',
    fontFamily: 'Arial, sans-serif',
    color: '#95a5a6',
    align: 'center'
  }).setOrigin(0.5);
}

function initializeDice(scene) {
  dice = [];
  const startX = 400 - ((diceCount * diceSize + (diceCount - 1) * 20) / 2) + diceSize / 2;
  const y = 300;
  
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
  buttonBg.fillRoundedRect(300, 450, 200, 60, 10);
  buttonBg.lineStyle(3, 0x2980b9, 1);
  buttonBg.strokeRoundedRect(300, 450, 200, 60, 10);
  
  // Button text
  const buttonText = scene.add.text(400, 480, 'ROLL DICE', {
    fontSize: '28px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    align: 'center',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // Make button interactive
  buttonBg.setInteractive(new Phaser.Geom.Rectangle(300, 450, 200, 60), Phaser.Geom.Rectangle.Contains);
  buttonBg.on('pointerdown', () => {
    if (!isRolling) {
      rollAllDice(scene);
    }
  });
  buttonBg.on('pointerover', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x5dade2, 1);
    buttonBg.fillRoundedRect(300, 450, 200, 60, 10);
    buttonBg.lineStyle(3, 0x3498db, 1);
    buttonBg.strokeRoundedRect(300, 450, 200, 60, 10);
  });
  buttonBg.on('pointerout', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x3498db, 1);
    buttonBg.fillRoundedRect(300, 450, 200, 60, 10);
    buttonBg.lineStyle(3, 0x2980b9, 1);
    buttonBg.strokeRoundedRect(300, 450, 200, 60, 10);
  });
  
  rollButton = { bg: buttonBg, text: buttonText };
}

function rollAllDice(scene) {
  if (isRolling) return;
  
  isRolling = true;
  playDiceClick(scene, 0.4); // Initial roll click
  
  dice.forEach((die) => {
    die.setScale(1.15);
  });
  
  // Step 2: Roll animation - rapidly change values and rotate in steps
  let rollCount = 0;
  const maxRolls = 12*3;
  const rollInterval = 40; // milliseconds - faster for smoother effect
  const rotationSteps = 5; // Number of discrete rotation steps
  const totalRotation = 360 * 3; // Rotate 3 full turns during roll
  const rotationPerStep = totalRotation / rotationSteps;
  
  const rollTimer = scene.time.addEvent({
    delay: rollInterval,
    callback: () => {
      rollCount++;
      
      // Play click sounds during roll (every few frames for clattering effect)
      if (rollCount % 3 === 0) {
        playDiceClick(scene, 0.15 + Math.random() * 0.1); // Varied intensity clicks
      }
      
      // Update all dice with random values during roll
      dice.forEach((die) => {
        const randomValue = rollDice();
        die.setValue(randomValue);
        
        // Rotate in discrete steps (every few frames)
        if (rollCount % Math.ceil(maxRolls / rotationSteps) === 0) {
          const currentStep = Math.floor(rollCount / Math.ceil(maxRolls / rotationSteps));
          const targetAngle = currentStep * rotationPerStep;
          die.setAngle(targetAngle);
        }
        
        // Move dice during roll animation
        die.moveRandom(rollCount, maxRolls);
      });
      
      // Check if we've reached the final roll
      if (rollCount >= maxRolls) {
        // Final roll - set actual random values and settle
        dice.forEach((die, index) => {
          const finalValue = rollDice();
          die.setValue(finalValue);
          
          // Step 3: Scale back down with bounce and reset rotation, return to initial position
          scene.tweens.add({
            targets: die.graphics,
            scaleX: 1,
            scaleY: 1,
            angle: 0, // Reset rotation to 0
            x: die.initialX,
            y: die.initialY,
            duration: 300,
            ease: 'Elastic.easeOut',
            onUpdate: (tween) => {
              die.angle = die.graphics.angle;
              die.x = die.graphics.x;
              die.y = die.graphics.y;
            },
            onComplete: () => {
              die.setPosition(die.initialX, die.initialY);
              die.setAngle(0); // Ensure angle is reset
              if (index === dice.length - 1) {
                isRolling = false;
                playDiceClick(scene, 0.25); // Final settle click
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
