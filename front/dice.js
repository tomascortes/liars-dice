/**
 * Dice Class - Object-oriented dice with position, rotation, and rendering
 */
class Dice {
  constructor(scene, x, y, size = 80, initialValue = 1, config) {
    this.scene = scene;
    this.directionX = 0;
    this.directionY = 0;
    this.config = config;
    this.initialX = x;
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.size = size;
    this.value = Math.max(1, Math.min(6, Math.floor(initialValue)));
    this.angle = 0;
    this.lastRotationSound = 0;
    this.velocity = 50
    
    this.graphics = scene.add.graphics();
    this.graphics.setPosition(this.x, this.y);
    
    this.render();
  }

/**
 * Get dot pattern for a dice face value (1-6)
 * Returns array of {x, y} coordinates relative to dice center
 */
  getDotPattern(value) {
  const base_spacing = 0.8;
  const center = { x: 0, y: 0 };
  const left_top = { x: -base_spacing, y: -base_spacing };
  const right_bottom = { x: base_spacing, y: base_spacing };
  const left_bottom = { x: -base_spacing, y: base_spacing };
  const right_top = { x: base_spacing, y: -base_spacing };
  const patterns = {
    1: [center],
    2: [left_top, right_bottom],
    3: [left_top, center, right_bottom],
    4: [left_top, right_bottom, left_bottom, right_top],
    5: [left_top, right_bottom, left_bottom, right_top, center],
    6: [left_top, right_bottom, left_bottom, right_top, center, center]
  };
  return patterns[value] || patterns[1];
}

/**
   * Play rotation sound effect - randomly selects between tick, tack, and clank
   */
  playRotationSound() {
    const now = Date.now();
    if (now - this.lastRotationSound < 200) return;
    this.lastRotationSound = now;
    
    const audioContext = this.scene.sound.context;
    const rand = Math.random();
    
    if (rand < 0.4) {
      this.playTickSound(audioContext);
    } else if (rand < 0.75) {
      this.playTackSound(audioContext);
    } else {
      this.playClankSound(audioContext);
    }
  }
  
  /**
   * Play "tick" sound - high-pitched, short, sharp (120-180 Hz, 8-13ms)
   */
  playTickSound(audioContext) {
    const intensity = 0.12 + Math.random() * 0.15;
    const duration = 0.008 + Math.random() * 0.005;
    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const baseFreq = 120 + Math.random() * 60;
    const noiseAmount = 0.2 + Math.random() * 0.3;
    const toneAmount = 1 - noiseAmount;
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const decay = Math.pow(1 - t, 2.5);
      const sineWave = Math.sin(2 * Math.PI * baseFreq * t / audioContext.sampleRate * bufferSize);
      const noise = (Math.random() * 2 - 1) * noiseAmount;
      data[i] = (sineWave * toneAmount + noise) * decay * intensity;
    }
    
    this.playAudioBuffer(audioContext, buffer, intensity, duration);
  }
  
  /**
   * Play "tack" sound - lower-pitched, longer, deeper (60-100 Hz, 15-25ms)
   */
  playTackSound(audioContext) {
    const intensity = 0.12 + Math.random() * 0.15;
    const duration = 0.015 + Math.random() * 0.01;
    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const baseFreq = 60 + Math.random() * 40;
    const noiseAmount = 0.2 + Math.random() * 0.3;
    const toneAmount = 1 - noiseAmount;
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const decay = Math.pow(1 - t, 1.8);
      const sineWave = Math.sin(2 * Math.PI * baseFreq * t / audioContext.sampleRate * bufferSize);
      const noise = (Math.random() * 2 - 1) * noiseAmount;
      data[i] = (sineWave * toneAmount + noise) * decay * intensity;
    }
    
    this.playAudioBuffer(audioContext, buffer, intensity, duration);
  }
  
  /**
   * Play "clank" sound - wood clank, lowest pitch, longest, most resonant (40-80 Hz, 20-30ms)
   */
  playClankSound(audioContext) {
    const intensity = 0.15 + Math.random() * 0.1;
    const duration = 0.02 + Math.random() * 0.01;
    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const baseFreq = 40 + Math.random() * 40;
    const noiseAmount = 0.1 + Math.random() * 0.2;
    const toneAmount = 1 - noiseAmount;
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const decay = Math.pow(1 - t, 1.5);
      
      const fundamental = Math.sin(2 * Math.PI * baseFreq * t / audioContext.sampleRate * bufferSize);
      const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 2 * t / audioContext.sampleRate * bufferSize) * 0.3;
      const harmonic3 = Math.sin(2 * Math.PI * baseFreq * 3 * t / audioContext.sampleRate * bufferSize) * 0.15;
      
      const tone = (fundamental + harmonic2 + harmonic3) * toneAmount;
      const noise = (Math.random() * 2 - 1) * noiseAmount;
      data[i] = (tone + noise) * decay * intensity;
    }
    
    this.playAudioBuffer(audioContext, buffer, intensity, duration);
  }
  
  /**
   * Helper method to play an audio buffer
   */
  playAudioBuffer(audioContext, buffer, intensity, duration) {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(intensity, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    source.start(audioContext.currentTime);
    source.stop(audioContext.currentTime + duration);
  }
  
  /**
   * Render the dice face with current value
   */
  render() {
    this.graphics.clear();
    const pattern = this.getDotPattern(this.value);
    this.drawBase();
    this.drawDots(pattern);
  }
  
  /**
   * Draw the dice base (square with border and 3D effect)
   */
  drawBase() {
    const x = -this.size / 2;
    const y = -this.size / 2;
    const borderWidth = 3;
    const cornerRadius = 4;
    
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillRoundedRect(x, y, this.size, this.size, cornerRadius);

    this.graphics.lineStyle(borderWidth, 0x000000, 0.4);
    this.graphics.beginPath();
    this.graphics.moveTo(x + cornerRadius, y + this.size);
    this.graphics.lineTo(x + this.size - cornerRadius, y + this.size);
    this.graphics.strokePath();
    this.graphics.beginPath();
    this.graphics.moveTo(x + this.size, y + cornerRadius);
    this.graphics.lineTo(x + this.size, y + this.size - cornerRadius);
    this.graphics.strokePath();
    
    this.graphics.lineStyle(borderWidth, 0x000000, 1);
    this.graphics.strokeRoundedRect(x, y, this.size, this.size, cornerRadius);
    
    this.graphics.fillStyle(0xffffff, 0.6);
    this.graphics.fillRoundedRect(x + 2, y + 2, this.size * 0.3, this.size * 0.3, 2);
  }
  
  /**
   * Draw dots on dice face based on pattern
   */
  drawDots(pattern) {
    const x = -this.size / 2;
    const y = -this.size / 2;
    const centerX = x + this.size / 2;
    const centerY = y + this.size / 2;
    const dotSize = this.size * 0.15;
    const spacing = this.size * 0.25;
    const shadowOffset = 1;
  
  pattern.forEach(dot => {
    const dotX = centerX + (dot.x * spacing);
    const dotY = centerY + (dot.y * spacing);
      
      this.graphics.fillStyle(0x000000, 0.3);
      this.graphics.fillRect(
        dotX - dotSize / 2 + shadowOffset, 
        dotY - dotSize / 2 + shadowOffset, 
        dotSize, 
        dotSize
      );
      
      this.graphics.fillStyle(0x000000, 1);
      this.graphics.fillRect(dotX - dotSize / 2, dotY - dotSize / 2, dotSize, dotSize);
  });
}

/**
   * Set the dice value and re-render
   */
  setValue(value) {
    this.value = Math.max(1, Math.min(6, Math.floor(value)));
    this.render();
  }
  
  /**
   * Update position coordinates
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.graphics.setPosition(x, y);
  }
  
  /**
   * Update rotation angle with sound
   */
  setAngle(angle) {
    const angleChanged = Math.abs(this.angle - angle) > 50;
    this.angle = angle;
    this.graphics.setAngle(angle);
    
    if (angleChanged) {
      this.playRotationSound();
    }
  }
  
  /**
   * Generate random value and update
   */
  roll() {
    const randomValue = Math.floor(Math.random() * 6) + 1;
    this.setValue(randomValue);
    return this.value;
  }
  
  /**
   * Set scale for animations
   */
  setScale(scale) {
    this.graphics.setScale(scale);
  }

  moveRandom(rollCount, maxRolls) {
    // 1. Initialize direction on first call (rollCount starts at 1 after increment)
    if (rollCount === 1) {
      const angle = Math.random() * 2 * Math.PI;
      this.directionX = Math.cos(angle) * this.velocity;
      this.directionY = Math.sin(angle) * this.velocity;
    }
    
    // 2. Determine phase: first half (random movement) or second half (return to origin)
    const isSecondHalf = rollCount / maxRolls >= 0.5;
    
    if (isSecondHalf) {
      // SECOND HALF: Move back toward initial position
      let targetX = this.x;
      let targetY = this.y;
      
      // Calculate direction toward initial position
      const deltaX = this.initialX - this.x + this.directionX*(1- rollCount/maxRolls);
      const deltaY = this.initialY - this.y + this.directionY*(1 - rollCount/maxRolls);
      
      // Move one step toward initial position
      if (Math.abs(deltaX) > 0) {
        const stepX = deltaX > 0 ? this.velocity : -this.velocity;
        targetX = this.x + stepX;
        
        // Clamp to initial position if close enough (avoid overshooting)
        if (Math.abs(deltaX) < this.velocity) {
          targetX = this.initialX;
        }
      } else {
        targetX = this.initialX;
      }
      
      if (Math.abs(deltaY) > 0) {
        const stepY = deltaY > 0 ? this.velocity : -this.velocity;
        targetY = this.y + stepY;
        
        // Clamp to initial position if close enough (avoid overshooting)
        if (Math.abs(deltaY) < this.velocity) {
          targetY = this.initialY;
        }
      } else {
        targetY = this.initialY;
      }
      
      // Update position
      this.x = targetX;
      this.y = targetY;
      this.setPosition(this.x, this.y);
    } else {
      // FIRST HALF: Move randomly with bouncing off walls
      let newX = this.x + this.directionX;
      let newY = this.y + this.directionY;
      
      // Handle wall bouncing
      if (newX < 0 || newX > this.config.width) {
        this.directionX = -this.directionX;
        newX = this.x + this.directionX;
      }
      if (newY < 0 || newY > this.config.height) {
        this.directionY = -this.directionY;
        newY = this.y + this.directionY;
      }
      
      // Update position (both internal state and graphics)
      this.x = newX;
      this.y = newY;
      this.setPosition(this.x, this.y);
    }
  }
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Dice,
    rollDice
  };
}
