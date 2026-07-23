const fs = require('fs');
let code = fs.readFileSync('src/pages/Masters.tsx', 'utf8');

code = code.replace(/else \{\n\s*if \(editItem\) updateDepartment\(editItem\.id, data\);\n\s*else addDepartment\(data\);\n\s*\}\n\s*else if \(modalType === 'item'\) \{/,
`else if (modalType === 'department') {
              if (editItem) updateDepartment(editItem.id, data);
              else addDepartment(data);
            }
            else if (modalType === 'item') {`);

fs.writeFileSync('src/pages/Masters.tsx', code);
