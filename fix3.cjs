const fs = require("fs")

const junk = `      </span>
    )
  }

  return (
    <Link
      href={href}
      className="border-border hover:bg-muted rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
    >
      {children}
    </Link>
  )
}`

const files = [
  "app/admin/invoices/page.tsx",
  "app/admin/plans/page.tsx",
  "app/admin/products/page.tsx",
  "app/admin/taxes/page.tsx",
  "app/admin/users/page.tsx",
]

for (const file of files) {
  let content = fs.readFileSync(file, "utf8")
  if (content.includes(junk)) {
    fs.writeFileSync(file, content.replace(junk, ""), "utf8")
    console.log("Fixed", file)
  } else {
    console.log("Not found in", file)
  }
}
