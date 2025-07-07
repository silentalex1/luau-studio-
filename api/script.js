module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { code, action } = req.body;

  if (!code || !action) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  try {
    if (action === 'check') {
      try {
        const lines = code.split('\n');
        let errors = [];

        lines.forEach((line, i) => {
          const lineNumber = i + 1;
          if (!line.trim()) return;

          if (line.match(/[^=]=[^=]/)) {
            errors.push(`Invalid single '=' at line ${lineNumber}. Did you mean '==' or '<='?`);
          }
          if (line.match(/function\s+\w*\s*\([^\)]*$/)) {
            errors.push(`Missing closing parenthesis for function at line ${lineNumber}.`);
          }
          if (line.match(/\{[^}]*$/) && !line.match(/--/)) {
            errors.push(`Missing closing brace '{' at line ${lineNumber}.`);
          }
          if (line.match(/\bdo\b.*$/) && !line.match(/end\b/)) {
            errors.push(`Missing 'end' for 'do' block at line ${lineNumber}.`);
          }
          if (line.match(/\bif\b.*then\b.*$/) && !line.match(/end\b/)) {
            errors.push(`Missing 'end' for 'if' block at line ${lineNumber}.`);
          }
          if (line.match(/\bwhile\b.*do\b.*$/) && !line.match(/end\b/)) {
            errors.push(`Missing 'end' for 'while' block at line ${lineNumber}.`);
          }
          if (line.match(/\bfor\b.*do\b.*$/) && !line.match(/end\b/)) {
            errors.push(`Missing 'end' for 'for' block at line ${lineNumber}.`);
          }
          if (line.match(/['"](?:(?!\1).)*$/)) {
            errors.push(`Unclosed string literal at line ${lineNumber}.`);
          }
        });
        res.status(200).json({ result: errors.length ? errors.join('\n') : 'No syntax errors detected' });
      } catch (e) {
        res.status(200).json({ result: `Syntax error during check: ${e.message}` });
      }
      return;
    }

    if (action === 'improve') {
      let improved = code.split('\n').map(line => {
        let trimmedLine = line.trim();

        if (trimmedLine.startsWith('local')) {
          return line.replace(/local\s+(\w+)/g, (match, varName) => {
            return `local ${varName.charAt(0).toUpperCase() + varName.slice(1)}`;
          });
        }
        if (trimmedLine.startsWith('function')) {
          return line.replace(/function\s+(\w+)\s*\((.*)\)/, (match, funcName, args) => {
            return `function ${funcName.charAt(0).toUpperCase() + funcName.slice(1)}(${args})`;
          });
        }
        return line;
      }).join('\n');

      improved = improved.replace(/\s+$/gm, '');

      res.status(200).json({ result: improved || 'No improvements suggested at this time.' });
      return;
    }

    if (action === 'humanize') {
      const comments = [
        '-- This section initializes variables for the script.',
        '-- The core logic for data processing starts here.',
        '-- A helper function to assist with calculations.',
        '-- Iterating through a collection of items.',
        '-- Performing a quick validation check.',
        '-- Handling edge cases or specific conditions.',
        '-- Returning the final computed result.',
        '-- Defining a new local function.',
        '-- Looping until a certain condition is met.',
        '-- Managing script events and responses.'
      ];
      let lines = code.split('\n');
      let humanized = [];

      lines.forEach((line, i) => {
        const trimmedLine = line.trim();
        const indentation = line.match(/^\s*/)[0];

        if (trimmedLine.length > 0) {
          if (Math.random() < 0.3) {
            humanized.push(`${indentation}${comments[Math.floor(Math.random() * comments.length)]}`);
          }
          humanized.push(line);
          if (Math.random() < 0.15 && !trimmedLine.endsWith('then') && !trimmedLine.endsWith('do') && !trimmedLine.startsWith('function') && !trimmedLine.startsWith('local')) {
            humanized.push('');
          }
        } else {
          humanized.push(line);
        }
      });
      res.status(200).json({ result: humanized.join('\n') || 'No changes made for humanization.' });
      return;
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
