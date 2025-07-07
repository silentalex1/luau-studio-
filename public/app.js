if (!localStorage.getItem('luauDevUser')) showAuthModal(true)
const scriptListEl = document.getElementById('scriptList')
const codeInput = document.getElementById('codeInput')
const outputEl = document.getElementById('output')
const executeBtn = document.getElementById('executeBtn')
const commitBtn = document.getElementById('commitBtn')
const actionSelect = document.getElementById('actionSelect')
const scriptTitle = document.getElementById('scriptTitle')
const newScriptBtn = document.getElementById('newScriptBtn')
const uploadBtn = document.getElementById('uploadBtn')
const fileUpload = document.getElementById('fileUpload')
const searchInput = document.getElementById('searchInput')
const logoutBtn = document.getElementById('logoutBtn')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signupBtn')
const loginTab = document.getElementById('loginTab')
const signupTab = document.getElementById('signupTab')
const loginForm = document.getElementById('loginForm')
const signupForm = document.getElementById('signupForm')
const submitLogin = document.getElementById('submitLogin')
const submitSignup = document.getElementById('submitSignup')
const loginError = document.getElementById('loginError')
const signupError = document.getElementById('signupError')
let scripts = JSON.parse(localStorage.getItem('luauDevScripts') || '[]')
let currentScriptId = null
function showAuthModal(show) {
  document.getElementById('authModal').classList.toggle('hidden', !show)
  loginForm.classList.toggle('hidden', show && signupTab.classList.contains('active'))
  signupForm.classList.toggle('hidden', show && loginTab.classList.contains('active'))
  loginTab.classList.toggle('active', show && !signupTab.classList.contains('active'))
  signupTab.classList.toggle('active', false)
  loginError.classList.add('hidden')
  signupError.classList.add('hidden')
  document.getElementById('loginUsername').value = ''
  document.getElementById('loginPassword').value = ''
  document.getElementById('signupUsername').value = ''
  document.getElementById('signupPassword').value = ''
  document.getElementById('confirmPassword').value = ''
}
function saveScripts() { localStorage.setItem('luauDevScripts', JSON.stringify(scripts)) }
function renderScriptList(filter = '') {
  scriptListEl.innerHTML = ''
  scripts.forEach((s, i) => {
    if (filter && !s.title.toLowerCase().includes(filter.toLowerCase())) return
    const li = document.createElement('li')
    li.textContent = s.title || 'Untitled Script'
    if (i === currentScriptId) li.classList.add('active')
    li.onclick = () => { currentScriptId = i; renderScript(); renderScriptList() }
    scriptListEl.appendChild(li)
  })
}
function renderScript() {
  if (currentScriptId === null) {
    codeInput.value = ''
    scriptTitle.textContent = 'New Script'
    outputEl.textContent = ''
    return
  }
  scriptTitle.textContent = scripts[currentScriptId].title || 'Untitled Script'
  codeInput.value = scripts[currentScriptId].code
  outputEl.textContent = ''
}
async function executeAction() {
  const code = codeInput.value.trim()
  if (!code) {
    outputEl.textContent = 'Please enter some code'
    return
  }
  if (currentScriptId === null) {
    scripts.push({title:code.slice(0,20),code,history:[]})
    currentScriptId = scripts.length - 1
    saveScripts()
    renderScriptList()
  } else {
    scripts[currentScriptId].code = code
    saveScripts()
  }
  const action = actionSelect.value
  if (action === 'history') {
    outputEl.textContent = scripts[currentScriptId].history.length ? 
      scripts[currentScriptId].history.map(h => `Commit ${h.id}: ${h.code.slice(0,50)}...`).join('\n') : 
      'No commit history'
    return
  }
  const res = await fetch('/api/script', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({code, action})
  })
  const data = await res.json()
  outputEl.textContent = data.result || 'Error processing script'
  renderScript()
}
function commitScript() {
  const code = codeInput.value.trim()
  if (!code) {
    outputEl.textContent = 'Please enter some code'
    return
  }
  if (currentScriptId === null) {
    scripts.push({title:code.slice(0,20),code,history:[]})
    currentScriptId = scripts.length - 1
  }
  scripts[currentScriptId].code = code
  scripts[currentScriptId].history.push({id: scripts[currentScriptId].history.length + 1, code, timestamp: new Date().toISOString()})
  saveScripts()
  outputEl.textContent = 'Script committed'
}
loginBtn.onclick = () => showAuthModal(true)
signupBtn.onclick = () => showAuthModal(true)
loginTab.onclick = () => {
  loginTab.classList.add('active')
  signupTab.classList.remove('active')
  loginForm.classList.remove('hidden')
  signupForm.classList.add('hidden')
  loginError.classList.add('hidden')
  signupError.classList.add('hidden')
}
signupTab.onclick = () => {
  signupTab.classList.add('active')
  loginTab.classList.remove('active')
  signupForm.classList.remove('hidden')
  loginForm.classList.add('hidden')
  loginError.classList.add('hidden')
  signupError.classList.add('hidden')
}
submitLogin.onclick = () => {
  const user = document.getElementById('loginUsername').value.trim()
  const pass = document.getElementById('loginPassword').value
  if (!user || !pass) {
    loginError.textContent = 'Please fill in all fields'
    loginError.classList.remove('hidden')
    return
  }
  const users = JSON.parse(localStorage.getItem('luauDevUsers') || '{}')
  if (users[user] && users[user].password === pass) {
    localStorage.setItem('luauDevUser', user)
    showAuthModal(false)
    renderScriptList()
  } else {
    loginError.textContent = 'Invalid username or password'
    loginError.classList.remove('hidden')
  }
}
submitSignup.onclick = () => {
  const user = document.getElementById('signupUsername').value.trim()
  const pass = document.getElementById('signupPassword').value
  const confirm = document.getElementById('confirmPassword').value
  if (!user || !pass || !confirm) {
    signupError.textContent = 'Please fill in all fields'
    signupError.classList.remove('hidden')
    return
  }
  if (pass !== confirm) {
    signupError.textContent = 'Passwords do not match'
    signupError.classList.remove('hidden')
    return
  }
  if (user.length < 3) {
    signupError.textContent = 'Username must be at least 3 characters'
    signupError.classList.remove('hidden')
    return
  }
  if (pass.length < 6) {
    signupError.textContent = 'Password must be at least 6 characters'
    signupError.classList.remove('hidden')
    return
  }
  const users = JSON.parse(localStorage.getItem('luauDevUsers') || '{}')
  if (users[user]) {
    signupError.textContent = 'Username already exists'
    signupError.classList.remove('hidden')
    return
  }
  users[user] = { password: pass }
  localStorage.setItem('luauDevUsers', JSON.stringify(users))
  localStorage.setItem('luauDevUser', user)
  showAuthModal(false)
  renderScriptList()
}
executeBtn.onclick = executeAction
commitBtn.onclick = commitScript
codeInput.onkeydown = e => { if (e.key === 'Enter' && e.ctrlKey) executeAction() }
newScriptBtn.onclick = () => {
  currentScriptId = null
  scriptTitle.textContent = 'New Script'
  codeInput.value = ''
  outputEl.textContent = ''
  renderScriptList()
}
uploadBtn.onclick = () => fileUpload.click()
fileUpload.onchange = e => {
  const file = e.target.files[0]
  if (!file) return
  if (!file.name.endsWith('.lua')) {
    outputEl.textContent = 'Please upload a .lua file'
    return
  }
  const reader = new FileReader()
  reader.onload = e => {
    const code = e.target.result
    scripts.push({title:file.name,code,history:[]})
    currentScriptId = scripts.length - 1
    saveScripts()
    renderScriptList()
    renderScript()
  }
  reader.readAsText(file)
}
searchInput.oninput = () => renderScriptList(searchInput.value.trim())
logoutBtn.onclick = () => {
  localStorage.removeItem('luauDevUser')
  showAuthModal(true)
}
renderScriptList()
renderScript()
