import {
  Archive,
  BookOpen,
  Pencil,
  RotateCcw,
  Users,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
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
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-sm font-semibold text-slate-950">
            Class directory
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Manage active and archived classes for this school.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Class</th>
              <th className="px-5 py-3 font-semibold">Academic year</th>
              <th className="px-5 py-3 font-semibold">Teachers</th>
              <th className="px-5 py-3 font-semibold">Students</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {classes.map((schoolClass) => (
              <tr className="transition hover:bg-slate-50" key={schoolClass.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                      {schoolClass.grade_level}
                    </div>

                    <div>
                      <p className="font-medium text-slate-950">
                        {schoolClass.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        Grade {schoolClass.grade_level}
                        {schoolClass.section ? ` · Section ${schoolClass.section}` : ''}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {schoolClass.academic_year}
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {schoolClass.teachers_count}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {schoolClass.students_count}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <Badge variant={schoolClass.is_active ? 'success' : 'muted'}>
                    {schoolClass.is_active ? 'Active' : 'Archived'}
                  </Badge>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      icon={<Pencil className="h-4 w-4" aria-hidden={true} />}
                      onClick={() => onEdit(schoolClass)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Edit
                    </Button>

                    <Button
                      icon={
                        schoolClass.is_active ? (
                          <Archive className="h-4 w-4" aria-hidden={true} />
                        ) : (
                          <RotateCcw className="h-4 w-4" aria-hidden={true} />
                        )
                      }
                      onClick={() => onArchiveToggle(schoolClass)}
                      size="sm"
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