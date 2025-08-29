// pages/upload/page.tsx
import DashboardLayout from '@/app/dashboard/v1/page'

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Upload</h1>
        <p className="text-[#8e9297]">Téléverser des fichiers...</p>
      </div>
    </DashboardLayout>
  )
}