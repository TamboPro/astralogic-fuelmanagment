// app/pages/v2/layout.tsx
import SidebarLayout from '@/components/ui/sidebar/SidebarLayout'

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarLayout>{children}</SidebarLayout>
}