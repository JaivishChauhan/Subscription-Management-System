import { ServiceForm } from "../_components/ServiceForm"

export const metadata = {
  title: "Create Service | Admin",
  description: "Create a new marketplace service.",
}

export default function CreateServicePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Service</h1>
        <p className="text-muted-foreground text-base">
          Add a new streaming, productivity, or software service to the
          marketplace catalog.
        </p>
      </div>

      <ServiceForm mode="create" />
    </div>
  )
}
