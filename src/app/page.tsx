"use client"
import { JobSearchForm } from "../components/JobSearchForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
        <p className="mt-2 text-sm text-gray-600">Upload your resume to find matching jobs.</p>
      </div>
    </header>
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <JobSearchForm />
      </div>
    </main>
  </div>
  );
}
