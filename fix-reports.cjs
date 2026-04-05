const fs = require('fs');
const p = 'app/admin/reports/page.tsx'
let content = fs.readFileSync(p, 'utf8');
if (!content.includes('overflow-x-auto')) {
     content = content.replace(/<table/g, '<div className=\"overflow-x-auto\">\n            <table');
     content = content.replace(/<\/table>/g, '</table>\n            </div>');
     fs.writeFileSync(p, content);
}
