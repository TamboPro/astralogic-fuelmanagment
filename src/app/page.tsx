// app/page.tsx
import DashboardLayout from '@/app/dashboard/v1/page'
import DashboardPage from '@/app/dashboard/v2/stations/page'
import SidebarLayout from '../components/ui/sidebar/SidebarLayout'

export default function Home() {
  return (
    <SidebarLayout>
      <DashboardPage />
    </SidebarLayout>
  )
};

  