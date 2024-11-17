import AuthenticationLayout from "@/layouts/AuthenticationLayout";
import { local } from "@/lib/utils";
import Identifier from "@/pages/public/Identifier";
import CatPage from "@/pages/public/cat/index";
import ChatLandingPage from "@/pages/public/chat/Chat.index";
import ClearLayout from "@/pages/public/clear/Clear.layout";
import ClearSession from "@/pages/public/clear/Clear.page";
import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import PrivateLayout from "../layouts/PrivateLayout";
import PublicLayout from "../layouts/PublicLayout";
import Dashboard from "../pages/private/Dashboard";
import User from "../pages/private/UserManagement";
import ForgotPassword from "../pages/public/ForgotPassword";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import ChatLayout from "../pages/public/chat/Chat.layout";
import ChatPage from "../pages/public/chat/Chat.page";

// Assume we have an isAuthenticated function
const isAuthenticated = () => {
  const tokens = local("json", "key").get("tokens")
  if (tokens && tokens?.access?.expires > new Date().toISOString()) return true
  return false
}

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children
}

const publicRoutes = [
  {
    path: "/cat",
    element: <CatPage />,
  },
  {
    path: "/",
    element: (
      <PublicRoute>
        <PublicLayout />
      </PublicRoute>
    ),
    children: [
      { index: true, element: <ChatLandingPage /> },
      // Clear routes
      {
        path: "clear",
        element: <ClearLayout />,
        children: [{ path: ":sessionId", element: <ClearSession /> }],
      },

      // Auth routes
      {
        path: "auth",
        element: <AuthenticationLayout />,
        children: [
          { path: "identifier", element: <Identifier /> },
          { path: "login", element: <Login /> },
          { path: "signup", element: <Signup /> },
          { path: "forgot-password", element: <ForgotPassword /> },
        ],
      },
      // Chat routes
      {
        path: "/",
        element: <ChatLayout />,
        children: [
          {
            path: ":sessionId",
            element: <ChatPage  />,
          },
        ],
      },
    ],
  },
]

const privateRoutes = [
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <PrivateLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "user", element: <User /> },
    ],
  },
]

const router = createBrowserRouter([...publicRoutes, ...privateRoutes])

export function Router() {
  return <RouterProvider router={router} />
}
