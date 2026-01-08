import Sidebar from './Sidebar'
import Header from './Header'
import Breadcrumbs from './Breadcrumbs'

const Layout = ({ children, breadcrumbs, headerBreadcrumbs }) => {
  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header breadcrumbs={headerBreadcrumbs} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout

