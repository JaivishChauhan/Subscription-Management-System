const fs = require('fs');

const filesToUpdate = [
  'app/admin/invoices/page.tsx',
  'app/admin/plans/page.tsx',
  'app/admin/products/page.tsx',
  'app/admin/services/page.tsx',
  'app/admin/subscriptions/page.tsx',
  'app/admin/taxes/page.tsx',
  'app/admin/users/page.tsx'
];

for (const p of filesToUpdate) {
  let content = fs.readFileSync(p, 'utf8');

  if (!content.includes('TablePagination')) {
    content = content.replace(/(import .*?\n)/, (match) => match + 'import { TablePagination } from "@/components/ui/table-pagination";\n');
  }

  const startIdx2 = content.indexOf('<div className="mt-5 flex flex-wrap items-center justify-between gap');
  if (startIdx2 !== -1) {
    const endIdx = content.indexOf('</section>', startIdx2);
    if (endIdx !== -1) {
       const totalMatch = content.match(/total(Invoices|Plans|Products|Services|Subscriptions|Taxes|Users)/);
       let totalVar = totalMatch ? totalMatch[0] : '0';
       
       const replacement = `<TablePagination 
          page={page} 
          pageSize={pageSize} 
          totalItems={${totalVar}} 
          totalPages={totalPages} 
        />
      </section>`;
       content = content.substring(0, startIdx2) + replacement + content.substring(endIdx + 10);
    }
  }

  if (!content.includes('overflow-x-auto')) {
     content = content.replace(/<table/g, '<div className="overflow-x-auto">\n            <table');
     content = content.replace(/<\/table>/g, '</table>\n            </div>');
  }

  content = content.replace(/function PaginationLink[\s\S]*?}\n\n?/g, '');
  
  fs.writeFileSync(p, content);
  console.log('Updated ' + p);
}
