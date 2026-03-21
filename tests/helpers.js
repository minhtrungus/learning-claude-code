export function assert(description, condition) {
  const el = document.getElementById('results');
  const pass = condition === true;
  el.innerHTML += `<div class="${pass ? 'pass' : 'fail'}">${pass ? '✓' : '✗'} ${description}</div>`;
  if (!pass) console.error('FAIL:', description);
}

export function section(name) {
  document.getElementById('results').innerHTML += `<h2>${name}</h2>`;
}
