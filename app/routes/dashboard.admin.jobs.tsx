export const handle = {
  crumb: () => ({
    href: `/dashboard/admin/jobs/`,
    name: "Jobs",
  }),
}

export default function DashboardAdminJobs() {
  return (
    <iframe
      className="absolute inset-0 top-28 h-[calc(100vh-7rem)] w-full"
      src="/dashboard/admin/bullboard"
      title="Bullboard"
    />
  )
}
