import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AppShell } from '@/components/app/AppShell'
import { Gate } from '@/components/app/Gate'
const Home = lazy(() => import('@/pages/Home'))
const PracticeSetup = lazy(() => import('@/pages/PracticeSetup'))
const PracticeSession = lazy(() => import('@/pages/PracticeSession'))
const Tests = lazy(() => import('@/pages/Tests'))
const TestRunner = lazy(() => import('@/pages/TestRunner'))
const TestResult = lazy(() => import('@/pages/TestResult'))
const Review = lazy(() => import('@/pages/Review'))
const Reference = lazy(() => import('@/pages/Reference'))
const Settings = lazy(() => import('@/pages/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter>
      <Gate>
      <Suspense fallback={<div className="min-h-dvh" />}>
      <Routes>
        {/* Test runner is full-screen, without the site chrome */}
        <Route path="/tests/run" element={<TestRunner />} />
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="practice" element={<PracticeSetup />} />
          <Route path="practice/session" element={<PracticeSession />} />
          <Route path="tests" element={<Tests />} />
          <Route path="tests/:id" element={<TestResult />} />
          <Route path="review" element={<Review />} />
          <Route path="reference" element={<Reference />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
      </Gate>
    </BrowserRouter>
  )
}
