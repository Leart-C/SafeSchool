export function StudentsPageHeader() {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
        School students
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
        Students
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Review students scoped to your school. Guardian and class counts come
        from SafeSchool relationships, not Clerk identity data.
      </p>
    </div>
  )
}