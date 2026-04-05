const fs = require('fs');

const p = 'app/admin/services/page.tsx';
let content = fs.readFileSync(p, 'utf8');

if (!content.includes('TablePagination')) {
  // Add import
}

// Find <div className="border-border overflow-hidden rounded-3xl border"> block end
let replaced = content.replace(
  /\s*<\/table>\s*<\/div>\s*<\/div>\s*<\/section>/,
  \
          </table>
        </div>
      </div>
      <TablePagination 
        page={page} 
        pageSize={pageSize} 
        totalItems={totalServices} 
        totalPages={totalPages} 
      />
    </section>\
);

fs.writeFileSync(p, replaced);
