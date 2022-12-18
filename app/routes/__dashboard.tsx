import { Outlet } from "@remix-run/react"

export default function DashboardLayout() {
  return (
    <>
      <header>This is the dashboard header</header>
      <main>
        <Outlet />
      </main>
      <footer>This is the dashboard footer</footer>
    </>
  )
}
