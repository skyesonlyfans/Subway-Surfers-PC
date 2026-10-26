/**
 * Xbox One Controller Adapter for Subway Surfers HTML Game
 * Maps Xbox Controller inputs to standard Subway Surfers keyboard controls:
 * - D-Pad / Left Stick: Up (Jump), Down (Roll), Left (Lane Left), Right (Lane Right)
 * - 'A' / 'X' Buttons: Spacebar (Hoverboard / Action)
 * - 'Start' / 'Menu' Button: Esc (Pause / Resume)
 * - 'Select' / 'View' Button: Restart / Enter
 */

(function () {
  'use me strict';

  // State tracking to prevent multi-triggering on held buttons
  const buttonState = {};
  const AXIS_THRESHOLD = 0.5; // Threshold for analog stick movement sensitivity

  // Virtual Key Dispatcher
  function simulateKeyEvent(type, key, keyCode) {
    const target = document.activeElement || document.body;
    const event = new KeyboardEvent(type, {
      key: key,
      code: key,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch to both parent window and any active iframe
    target.dispatchEvent(event);
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.dispatchEvent(event);
        }
      } catch (e) {
        // Handle potential cross-origin restriction silently
      }
    });
  }

  function triggerKeyPress(key, keyCode) {
    simulateKeyEvent('keydown', key, keyCode);
    setTimeout(() => {
      simulateKeyEvent('keyup', key, keyCode);
    }, 100);
  }

  function pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads) return;

    for (const gamepad of gamepads) {
      if (!gamepad) continue;

      // Xbox standard button indices:
      // 0: A, 1: B, 2: X, 3: Y
      // 12: D-Up, 13: D-Down, 14: D-Left, 15: D-Right
      // 9: Start/Menu, 8: Select/View

      // --- Digital Buttons ---
      checkButton(gamepad, 0, 'Space', 32);  // A Button -> Jump / Hoverboard
      checkButton(gamepad, 2, 'Space', 32);  // X Button -> Jump / Hoverboard
      checkButton(gamepad, 12, 'ArrowUp', 38);   // D-Pad Up -> Jump
      checkButton(gamepad, 13, 'ArrowDown', 40); // D-Pad Down -> Roll
      checkButton(gamepad, 14, 'ArrowLeft', 37); // D-Pad Left -> Move Left
      checkButton(gamepad, 15, 'ArrowRight', 39);// D-Pad Right -> Move Right
      checkButton(gamepad, 9, 'Escape', 27);     // Start -> Pause
      checkButton(gamepad, 8, 'Enter', 13);      // Select -> Confirm / Restart

      // --- Analog Left Stick ---
      const axisX = gamepad.axes[0]; // -1 Left, +1 Right
      const axisY = gamepad.axes[1]; // -1 Up, +1 Down

      checkAxis(axisX < -AXIS_THRESHOLD, 'StickLeft', 'ArrowLeft', 37);
      checkAxis(axisX > AXIS_THRESHOLD, 'StickRight', 'ArrowRight', 39);
      checkAxis(axisY < -AXIS_THRESHOLD, 'StickUp', 'ArrowUp', 38);
      checkAxis(axisY > AXIS_THRESHOLD, 'StickDown', 'ArrowDown', 40);
    }

    requestAnimationFrame(pollGamepad);
  }

  function checkButton(gamepad, buttonIdx, keyName, keyCode) {
    const btn = gamepad.buttons[buttonIdx];
    const isPressed = btn ? btn.pressed : false;
    const stateKey = `btn_${buttonIdx}`;

    if (isPressed && !buttonState[stateKey]) {
      buttonState[stateKey] = true;
      triggerKeyPress(keyName, keyCode);
    } else if (!isPressed && buttonState[stateKey]) {
      buttonState[stateKey] = false;
    }
  }

  function checkAxis(isTriggered, stateKey, keyName, keyCode) {
    if (isTriggered && !buttonState[stateKey]) {
      buttonState[stateKey] = true;
      triggerKeyPress(keyName, keyCode);
    } else if (!isTriggered && buttonState[stateKey]) {
      buttonState[stateKey] = false;
    }
  }

  // Initialize event listeners when gamepad is detected
  window.addEventListener('gamepadconnected', (e) => {
    console.log(`Xbox Controller Connected: ${e.gamepad.id}`);
    requestAnimationFrame(pollGamepad);
  });

  // Fallback continuous polling loop
  requestAnimationFrame(pollGamepad);
})();