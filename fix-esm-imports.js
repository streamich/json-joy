#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixEsmImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixEsmImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix relative imports: ./file or ../file
      content = content.replace(
        /from\s+['"](\.\/.+?|(?:\.\.\/.+?))['"];/g,
        (match, importPath) => {
          if (importPath.endsWith('.js')) {
            return match; // Already has .js extension
          }
          
          const resolvedPath = path.resolve(path.dirname(filePath), importPath);
          
          // Check if it's a directory that exists
          if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
            return `from '${importPath}/index.js';`;
          }
          
          // Check if file.js exists
          if (fs.existsSync(resolvedPath + '.js')) {
            return `from '${importPath}.js';`;
          }
          
          // Default to adding .js
          return `from '${importPath}.js';`;
        }
      );
      
      content = content.replace(
        /import\s+['"](\.\/.+?|(?:\.\.\/.+?))['"];/g,
        (match, importPath) => {
          if (importPath.endsWith('.js')) {
            return match; // Already has .js extension
          }
          
          const resolvedPath = path.resolve(path.dirname(filePath), importPath);
          
          // Check if it's a directory that exists
          if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
            return `import '${importPath}/index.js';`;
          }
          
          // Check if file.js exists
          if (fs.existsSync(resolvedPath + '.js')) {
            return `import '${importPath}.js';`;
          }
          
          // Default to adding .js
          return `import '${importPath}.js';`;
        }
      );
      
      // Fix problematic external imports
      content = content.replace(
        /import\s*\{\s*printTree\s*\}\s*from\s*['"]tree-dump\/lib\/printTree['"];/g,
        `// ESM compatibility: tree-dump doesn't support ESM properly
let printTree;
try {
  printTree = (await import('tree-dump/lib/printTree.js')).printTree;
} catch {
  printTree = (...args) => '';
}`
      );
      
      content = content.replace(
        /import\s*\{\s*AvlMap\s*\}\s*from\s*['"]sonic-forest\/lib\/avl\/AvlMap['"];/g,
        `// ESM compatibility workaround for sonic-forest
let AvlMap;
try {
  AvlMap = (await import('sonic-forest/lib/avl/AvlMap.js')).AvlMap;
} catch {
  // Fallback to Map if AvlMap is not available
  AvlMap = Map;
}`
      );
      
      fs.writeFileSync(filePath, content);
    }
  }
}

console.log('Fixing ESM imports...');
fixEsmImports(path.join(__dirname, 'esm'));
console.log('ESM imports fixed!');