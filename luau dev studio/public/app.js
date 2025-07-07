if (!localStorage.getItem('luauDevUser')) showAuthModal(true)
const scriptListEl = document.getElementById('scriptList')
const codeInput = document.getElementById('codeInput')
const outputEl = document.getElementById('output')
const executeBtn = document.getElementById('executeBtn')
const actionSelect = document.getElementById('actionSelect')
const scriptTitle = document.getElementById('scriptTitle')
const newScriptBtn = document.getElementById('newScriptBtn')
const logoutBtn = document.getElementById('logoutBtn')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signupBtn')
const loginTab = document.getElementById('loginTab')
const signupTab = document.getElementById('signupTab')
const loginForm = document.getElementById('loginForm')
const signupForm = document.getElementById('signupForm')
const submitLogin = document.getElementById('submitLogin')
const submitSignup = document.getElementById('submitSignup')
let scripts = JSON.parse(localStorage.getItem('luauDevScripts') || '[]')
let currentScriptId = null
function showAuthModal(show) {
  document.getElementById('authModal').classList.toggle('hidden', !show)
  loginForm.classList.add('hidden')
  signupForm.classList.add('hidden')
  loginTab.classList.add('active')
  signupTab.classList.remove('active')
  loginForm.classList.remove('hidden')
}
function saveScripts() { localStorage.setItem('luauDevScripts', JSON.stringify(scripts)) }
function renderScriptList() {
  scriptListEl.innerHTML = ''
  scripts.forEach((s, i) => {
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
  if (!code) return alert('Please enter some code')
  if (currentScriptId === null) {
    scripts.push({title:code.slice(0,20),code})
    currentScriptId = scripts.length - 1
    saveScripts()
    renderScriptList()
  } else {
    scripts[currentScriptId].code = code
    saveScripts()
  }
  const action = actionSelect.value
  const res = await fetch('/api/script', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({code, action})
  })
  const data = await res.json()
  outputEl.textContent = data.result || 'Error processing script'
  renderScript()
}
loginBtn.onclick = () => showAuthModal(true)
signupBtn.onclick = () => showAuthModal(true)
loginTab.onclick = () => {
  loginTab.classList.add('active')
  signupTab.classList.remove('active')
  loginForm.classList.remove('hidden')
  signupForm.classList.add('hidden')
}
signupTab.onclick = () => {
  signupTab.classList.add('active')
  loginTab.classList.remove('active')
  signupForm.classList.remove('hidden')
  loginForm.classList.add('hidden')
}
submitLogin.onclick = () => {
  const user = document.getElementById('loginUsername').value.trim()
  const pass = document.getElementById('loginPassword').value
  if (!user || !pass) return alert('Please fill in all fields')
  const users = JSON.parse(localStorage.getItem('luauDevUsers') || '{}')
  if (users[user] && users[user].password === pass) {
    localStorage.setItem('luauDevUser', user)
    showAuthModal(false)
    renderScriptList()
  } else {
    alert('Invalid username or password')
  }
}
submitSignup.onclick = () => {
  const user = document.getElementById('signupUsername').value.trim()
  const pass = document.getElementById('signupPassword').value
  const confirm = document.getElementById('confirmPassword').value
  if (!user || !pass || !confirm) return alert('Please fill in all fields')
  if (pass !== confirm) return alert('Passwords do not match')
  const users = JSON.parse(localStorage.getItem('luauDevUsers') || '{}')
  if (users[user]) return alert('Username already exists')
  users[user] = { password: pass }
  localStorage.setItem('luauDevUsers', JSON.stringify(users))
  localStorage.setItem('luauDevUser', user)
  showAuthModal(false)
  renderScriptList()
}
executeBtn.onclick = executeAction
codeInput.onkeydown = e => { if (e.key === 'Enter' && e.ctrlKey) executeAction() }
newScriptBtn.onclick = () => {
  currentScriptId = null
  scriptTitle.textContent = 'New Script'
  codeInput.value = ''
  outputEl.textContent = ''
  renderScriptList()
}
logoutBtn.onclick = () => {
  localStorage.removeItem('luauDevUser')
  showAuthModal(true)
}
renderScriptList()
renderScript()