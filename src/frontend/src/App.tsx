import { Layout } from "@/components/Layout";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";

import { AdminPage } from "@/pages/Admin";
// Lazy page imports via direct imports (small app, fine to import directly)
import { HomePage } from "@/pages/Home";
import { LoginPage } from "@/pages/Login";
import { ParentPortalPage } from "@/pages/ParentPortal";
import { StudentPortalPage } from "@/pages/StudentPortal";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student",
  component: StudentPortalPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const parentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/parent",
  component: ParentPortalPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  studentRoute,
  adminRoute,
  parentRoute,
  loginRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
