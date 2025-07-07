const scriptListEl = document.getElementById('scriptList');
const codeInput = document.getElementById('codeInput');
const outputEl = document.getElementById('output');
const executeBtn = document.getElementById('executeBtn');
const commitBtn = document.getElementById('commitBtn');
const actionSelect = document.getElementById('actionSelect');
const scriptTitle = document.getElementById('scriptTitle');
const newScriptBtn = document.getElementById('newScriptBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileUpload = document.getElementById('fileUpload');
const searchInput = document.getElementById('searchInput');

let scripts = JSON.parse(localStorage.getItem('luauDevScripts') || '[]');
let currentScriptId = null;

function saveScripts() {
  localStorage.setItem('luauDevScripts', JSON.stringify(scripts));
}

function renderScriptList(filter = '') {
  scriptListEl.innerHTML = '';
  scripts.forEach((s, i) => {
    if (filter && !s.title.toLowerCase().includes(filter.toLowerCase())) return;
    const li = document.createElement('li');
    li.textContent = s.title || 'Untitled Script';
    li.classList.add('p-3', 'rounded-lg', 'cursor-pointer', 'hover:bg-gray-700', 'transition', 'duration-150');
    if (i === currentScriptId) {
      li.classList.add('bg-blue-600', 'text-white', 'font-bold');
      li.classList.remove('hover:bg-gray-700');
    } else {
      li.classList.add('bg-gray-800');
    }
    li.onclick = () => {
      currentScriptId = i;
      renderScript();
      renderScriptList();
    };
    scriptListEl.appendChild(li);
  });
}

function renderScript() {
  if (currentScriptId === null) {
    codeInput.value = '';
    scriptTitle.textContent = 'New Script';
    outputEl.textContent = '';
    return;
  }
  scriptTitle.textContent = scripts[currentScriptId].title || 'Untitled Script';
  codeInput.value = scripts[currentScriptId].code;
  outputEl.textContent = '';
}

async function executeAction() {
  const code = codeInput.value.trim();
  if (!code) {
    outputEl.textContent = 'Please enter some code';
    return;
  }

  if (currentScriptId === null) {
    scripts.push({ title: code.slice(0, 20), code, history: [] });
    currentScriptId = scripts.length - 1;
    saveScripts();
    renderScriptList();
  } else {
    scripts[currentScriptId].code = code;
    saveScripts();
  }

  const action = actionSelect.value;

  if (action === 'history') {
    outputEl.textContent = scripts[currentScriptId].history.length
      ? scripts[currentScriptId].history.map(h => `Commit ${h.id}: ${h.code.slice(0, 50)}...`).join('\n')
      : 'No commit history';
    return;
  }

  try {
    const res = await fetch('/api/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, action }),
    });
    const data = await res.json();
    outputEl.textContent = data.result || 'Error processing script';
    renderScript();
  } catch (error) {
    outputEl.textContent = `Network or server error: ${error.message}`;
  }
}

function commitScript() {
  const code = codeInput.value.trim();
  if (!code) {
    outputEl.textContent = 'Please enter some code';
    return;
  }

  if (currentScriptId === null) {
    scripts.push({ title: code.slice(0, 20), code, history: [] });
    currentScriptId = scripts.length - 1;
  }

  scripts[currentScriptId].code = code;
  scripts[currentScriptId].history.push({ id: scripts[currentScriptId].history.length + 1, code, timestamp: new Date().toISOString() });
  saveScripts();
  outputEl.textContent = 'Script committed';
}

executeBtn.onclick = executeAction;
commitBtn.onclick = commitScript;
codeInput.onkeydown = e => {
  if (e.key === 'Enter' && e.ctrlKey) executeAction();
};

newScriptBtn.onclick = () => {
  currentScriptId = null;
  scriptTitle.textContent = 'New Script';
  codeInput.value = '';
  outputEl.textContent = '';
  renderScriptList();
};

uploadBtn.onclick = () => fileUpload.click();

fileUpload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.name.endsWith('.lua')) {
    outputEl.textContent = 'Please upload a .lua file';
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const code = e.target.result;
    scripts.push({ title: file.name, code, history: [] });
    currentScriptId = scripts.length - 1;
    saveScripts();
    renderScriptList();
    renderScript();
  };
  reader.readAsText(file);
};

searchInput.oninput = () => renderScriptList(searchInput.value.trim());

renderScriptList();
renderScript();
