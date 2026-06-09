import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { SchoolClass } from '../../services/classService'

type ClassesTableProps = {
  classes: SchoolClass[]
  onArchiveToggle: (schoolClass: SchoolClass) => void
  onEdit: (schoolClass: SchoolClass) => void
}

export function ClassesTable({
  classes,
  onArchiveToggle,
  onEdit,
}: ClassesTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Class</th>
              <th className="px-5 py-3 font-semibold">Grade</th>
              <th className="px-5 py-3 font-semibold">Academic year</th>
              <th className="px-5 py-3 font-semibold">Teachers</th>
              <th className="px-5 py-3 font-semibold">Students</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {classes.map((schoolClass) => (
              <tr className="transition hover:bg-slate-50" key={schoolClass.id}>
                <td className="px-5 py-4 font-medium text-slate-950">
                  {schoolClass.name}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {schoolClass.grade_level}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {schoolClass.academic_year}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {schoolClass.teachers_count}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {schoolClass.students_count}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                      schoolClass.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {schoolClass.is_active ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onEdit(schoolClass)}
                      type="button"
                      variant="secondary"
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => onArchiveToggle(schoolClass)}
                      type="button"
                      variant="ghost"
                    >
                      {schoolClass.is_active ? 'Archive' : 'Restore'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}