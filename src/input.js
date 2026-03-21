/**
 * Sets up click and touch listeners on the canvas.
 * Calls onDrop(canvasX) when the user taps/clicks.
 * canvasX is clamped by main.js to [radius, 480 - radius].
 * @param {HTMLCanvasElement} canvas
 * @param {(x: number) => void} onDrop
 * @param {() => boolean} isLocked - returns true when input should be ignored
 */
export function setupInput(canvas, onDrop, isLocked) {
  function getCanvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / rect.width;
    return (clientX - rect.left) * ratio;
  }

  canvas.addEventListener('mousedown', (e) => {
    if (isLocked()) return;
    onDrop(getCanvasX(e.clientX));
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isLocked()) return;
    const touch = e.touches[0];
    onDrop(getCanvasX(touch.clientX));
  }, { passive: false });
}
