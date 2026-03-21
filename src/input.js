/**
 * Sets up click, touch, and move listeners on the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {(x: number) => void} onDrop - called on click/tap
 * @param {(x: number) => void} onMove - called on mousemove/touchmove
 * @param {() => boolean} isLocked - returns true when input should be ignored
 */
export function setupInput(canvas, onDrop, onMove, isLocked) {
  function getCanvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / rect.width;
    return (clientX - rect.left) * ratio;
  }

  canvas.addEventListener('mousedown', (e) => {
    if (isLocked()) return;
    onDrop(getCanvasX(e.clientX));
  });

  canvas.addEventListener('mousemove', (e) => {
    onMove(getCanvasX(e.clientX));
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isLocked()) return;
    const touch = e.touches[0];
    onDrop(getCanvasX(touch.clientX));
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onMove(getCanvasX(touch.clientX));
  }, { passive: false });
}
