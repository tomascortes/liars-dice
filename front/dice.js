// Dice Generation Module
// Object-oriented Dice class using Phaser Graphics API

/**
 * Dice Class - Object-oriented dice with position, rotation, and rendering
 */
class Dice {
  constructor(scene, x, y, size = 80, initialValue = 1) {
    this.scene = scene;
    this.x = x; // Center X position
    this.y = y; // Center Y position
    this.size = size;
    this.value = Math.max(1, Math.min(6, Math.floor(initialValue)));
    this.angle = 0;
    this.lastRotationSound = 0; // Track last rotation sound time to avoid spam
    
    // Create graphics object
    this.graphics = scene.add.graphics();
    this.graphics.setPosition(this.x, this.y);
    
    // Initial render
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
      1: [center], // Center
      2: [left_top, right_bottom], // Diagonal
      3: [left_top, center, right_bottom], // Diagonal line
      4: [left_top, right_bottom, left_bottom, right_top], // Four corners
      5: [left_top, right_bottom, left_bottom, right_top, center], // Four corners + center
      6: [left_top, right_bottom, left_bottom, right_top, center, center] // Two columns
    };
    return patterns[value] || patterns[1];
  }
  
  /**
   * Play rotation sound effect - varied "tick tack" pattern with randomness
   */
  playRotationSound() {
    const now = Date.now();
    // Throttle sounds to avoid too many at once (max 1 per 200ms - much slower)
    if (now - this.lastRotationSound < 200) return;
    this.lastRotationSound = now;
    
    const audioContext = this.scene.sound.context;
    
    // Random variation for "tick" (higher, shorter) vs "tack" (lower, longer)
    const isTick = Math.random() > 0.4; // 60% chance of "tick", 40% "tack"
    const intensity = 0.12 + Math.random() * 0.15; // Varied intensity
    
    // Varied duration: ticks are shorter, tacks are longer
    const duration = isTick ? 0.008 + Math.random() * 0.005 : 0.015 + Math.random() * 0.01;
    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Varied frequency: ticks are higher pitch, tacks are lower
    const baseFreq = isTick 
      ? 120 + Math.random() * 60  // "tick" - 120-180 Hz (higher)
      : 60 + Math.random() * 40;  // "tack" - 60-100 Hz (lower, deeper)
    
    // Random sound character variation
    const noiseAmount = 0.2 + Math.random() * 0.3; // 20-50% noise
    const toneAmount = 1 - noiseAmount;
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Varied decay: ticks decay faster, tacks decay slower
      const decayPower = isTick ? 2.5 : 1.8;
      const decay = Math.pow(1 - t, decayPower);
      
      // Mix tone with noise for varied character
      const sineWave = Math.sin(2 * Math.PI * baseFreq * t / audioContext.sampleRate * bufferSize);
      const noise = (Math.random() * 2 - 1) * noiseAmount;
      data[i] = (sineWave * toneAmount + noise) * decay * intensity;
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Varied fade out
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

    // Draw shadow on bottom and right sides only (for 3D effect)
    this.graphics.lineStyle(borderWidth, 0x000000, 0.4);
    // Bottom edge shadow
    this.graphics.beginPath();
    this.graphics.moveTo(x + cornerRadius, y + this.size);
    this.graphics.lineTo(x + this.size - cornerRadius, y + this.size);
    this.graphics.strokePath();
    // Right edge shadow
    this.graphics.beginPath();
    this.graphics.moveTo(x + this.size, y + cornerRadius);
    this.graphics.lineTo(x + this.size, y + this.size - cornerRadius);
    this.graphics.strokePath();
    
    // Main border on all sides
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
    const dotSize = this.size * 0.15; // 15% of dice size for square dots
    const spacing = this.size * 0.25; // 25% of dice size for spacing
    const shadowOffset = 1; // 1 pixel shadow offset
    
    pattern.forEach(dot => {
      const dotX = centerX + (dot.x * spacing);
      const dotY = centerY + (dot.y * spacing);
      
      // Draw shadow first (slightly offset to bottom-right)
      this.graphics.fillStyle(0x000000, 0.3);
      this.graphics.fillRect(
        dotX - dotSize / 2 + shadowOffset, 
        dotY - dotSize / 2 + shadowOffset, 
        dotSize, 
        dotSize
      );
      
      // Draw main square on top
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
    // Only play sound on larger angle changes (less frequent ticks)
    const angleChanged = Math.abs(this.angle - angle) > 50; // Larger threshold = fewer sounds
    this.angle = angle;
    this.graphics.setAngle(angle);
    
    // Play rotation sound when angle changes significantly
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
}

/**
 * Generate a random dice value (1-6) - utility function
 */
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// Export functions and class (if using modules, otherwise they'll be global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Dice,
    rollDice
  };
}
