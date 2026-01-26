import React from "react";
import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbarProvider, RefineKbar } from "@refinedev/kbar";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import {
  useNotificationProvider,
  ThemedLayout,
  ErrorComponent,
} from "@refinedev/antd";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import {
  ShoppingOutlined,
  DashboardOutlined,
  UserOutlined,
  UnorderedListOutlined,
  TagsOutlined,
} from "@ant-design/icons";

import { DashboardPage } from "./pages/dashboard";
import { OrderList, OrderShow } from "./pages/orders";
import { AuthPage } from "./pages/auth";
import { CustomerShow, CustomerList } from "./pages/customers";
import { CourierList, CourierCreate, CourierEdit } from "./pages/couriers";
import {
  ProductList,
  ProductCreate,
  ProductEdit,
  ProductShow,
} from "./pages/products";
import { CategoryList } from "./pages/categories";

import { Header, Title } from "./components";
import { BikeWhiteIcon } from "./components/ui/icons";
import { ConfigProvider } from "./context";
import theme from "./theme.json";
import "@refinedev/antd/dist/reset.css";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { App as AntdApp } from "antd";

const App: React.FC = () => {
  // This hook is used to automatically login the user.
  // We use this hook to skip the login page and demonstrate the application more quickly.

  return (
    <BrowserRouter>
      <ConfigProvider theme={{ ...theme }}>
        <AntdApp>
          <RefineKbarProvider>
            <DevtoolsProvider>
              <Refine
                routerProvider={routerProvider}
                dataProvider={dataProvider}
                authProvider={authProvider}
                notificationProvider={useNotificationProvider}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  reactQuery: {
                    clientConfig: {
                      defaultOptions: {
                        queries: {
                          retry: false, // 🔑 do NOT retry on 401
                          refetchOnWindowFocus: false,
                          staleTime: 30 * 1000,
                        },
                        mutations: {
                          retry: false,
                        },
                      },
                    },
                  },
                }}
                resources={[
                  {
                    name: "dashboard",
                    list: "/",
                    meta: {
                      label: "Dashboard",
                      icon: <DashboardOutlined />,
                    },
                  },
                  {
                    name: "orders",
                    list: "/orders",
                    show: "/orders/:id",
                    meta: {
                      icon: <ShoppingOutlined />,
                    },
                  },
                  {
                    name: "users",
                    list: "/customers",
                    show: "/customers/:id",
                    meta: {
                      icon: <UserOutlined />,
                    },
                  },
                  {
                    name: "products",
                    list: "/products",
                    create: "/products/new",
                    edit: "/products/:id/edit",
                    show: "/products/:id",
                    meta: {
                      icon: <UnorderedListOutlined />,
                    },
                  },
                  {
                    name: "categories",
                    list: "/categories",
                    meta: {
                      icon: <TagsOutlined />,
                    },
                  },

                  {
                    name: "couriers",
                    list: "/couriers",
                    create: "/couriers/new",
                    edit: "/couriers/:id/edit",
                    show: "/couriers/:id",
                    meta: {
                      icon: <BikeWhiteIcon />,
                    },
                  },
                ]}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-routes"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout Header={Header} Title={Title}>
                          <div
                            style={{
                              maxWidth: "1200px",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          >
                            <Outlet />
                          </div>
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route index element={<DashboardPage />} />

                    <Route path="/orders">
                      <Route index element={<OrderList />} />
                      <Route path=":id" element={<OrderShow />} />
                    </Route>

                    <Route
                      path="/customers"
                      element={
                        <CustomerList>
                          <Outlet />
                        </CustomerList>
                      }
                    >
                      <Route path=":id" element={<CustomerShow />} />
                    </Route>

                    <Route
                      path="/products"
                      element={
                        <ProductList>
                          <Outlet />
                        </ProductList>
                      }
                    >
                      <Route path="new" element={<ProductCreate />} />
                      <Route path=":id" element={<ProductShow />} />
                      <Route path=":id/edit" element={<ProductEdit />} />
                    </Route>

                    <Route path="/categories" element={<CategoryList />} />

                    <Route path="/couriers">
                      <Route
                        path=""
                        element={
                          <CourierList>
                            <Outlet />
                          </CourierList>
                        }
                      >
                        <Route path="new" element={<CourierCreate />} />
                      </Route>

                      <Route path=":id/edit" element={<CourierEdit />} />
                    </Route>
                  </Route>

                  <Route
                    element={
                      <Authenticated key="auth-pages" fallback={<Outlet />}>
                        <NavigateToResource resource="dashboard" />
                      </Authenticated>
                    }
                  >
                    <Route
                      path="/login"
                      element={
                        <AuthPage
                          type="login"
                          formProps={{
                            initialValues: {
                              email: "demo@refine.dev",
                              password: "demodemo",
                            },
                          }}
                        />
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <AuthPage
                          type="register"
                          formProps={{
                            initialValues: {
                              email: "demo@refine.dev",
                              password: "demodemo",
                            },
                          }}
                        />
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={<AuthPage type="forgotPassword" />}
                    />
                    <Route
                      path="/update-password"
                      element={<AuthPage type="updatePassword" />}
                    />
                  </Route>

                  <Route
                    element={
                      <Authenticated key="catch-all">
                        <ThemedLayout Header={Header} Title={Title}>
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
                <RefineKbar />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </RefineKbarProvider>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
