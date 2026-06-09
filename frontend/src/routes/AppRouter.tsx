import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
} from '@clerk/clerk-react'
import { SignedOutHome } from '../features/auth/SignedOutHome'
import { DashboardHome } from '../features/dashboard/DashboardHome'
import { AttendancePage } from '../features/attendance/AttendancePage'
import { ClassesPage } from '../features/classes/ClassesPage'
import { MessagesPage } from '../features/messages/MessagesPage'
import { StudentsPage } from '../features/students/StudentsPage'
import { StudentProfilePage } from '../features/students/StudentProfilePage'
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout'

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <SignedOut>
              <SignedOutHome />
            </SignedOut>

            <SignedIn>
              <Navigate replace to="/app/dashboard" />
            </SignedIn>
          </>
        }
      />

      <Route
        path="/app"
        element={
          <SignedIn>
            <AuthenticatedLayout />
          </SignedIn>
        }
      >
        <Route index element={<Navigate replace to="/app/dashboard" />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:studentId" element={<StudentProfilePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}