module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  const { code, action } = req.body
  if (!code || !action) {
    res.status(400).json({ error: 'Missing parameters' })
    return
  }
  try {
    if (action === 'check') {
      try {
        const lines = code.split('\n')
        let error = null
        lines.forEach((line, i) => {
          if (!line.trim()) return
          if (line.match(/[^=]=[^=]/)) error = `Invalid single '=' at line ${i + 1}`
          if (line.match(/function.*\(/) && !line.match(/\)/)) error = `Missing closing parenthesis at line ${i + 1}`
          if (line.match(/\{/) && !line.match(/\}/)) error = `Missing closing brace at line ${i + 1}`
          if (line.match(/do\b/) && !line.match(/end\b/)) error = `Missing 'end' for 'do' block at line ${i + 1}`
        })
        res.status(200).json({ result: error || 'No syntax errors detected' })
      } catch (e) {
        res.status(200).json({ result: `Syntax error: ${e.message}` })
      }
      return
    }
    if (action === 'improve') {
      let improved = code.split('\n').map(line => {
        if (line.match(/local\s+\w+\s*=/)) {
          return line.replace(/local\s+(\w+)/, (match, varName) => {
            return `local ${varName.charAt(0).toUpperCase() + varName.slice(1)}`
          })
        }
        return line
      }).join('\n')
      improved = improved.replace(/\s+$/gm, '')
      res.status(200).json({ result: improved || 'No improvements needed' })
      return
    }
    res.status(400).json({ error: 'Invalid action' })
  } catch {
    res.status(500).json({ error: 'Internal error' })
  }
}