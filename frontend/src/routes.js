import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import Scenarios from "views/admin/scenarios";
import Setup from "views/admin/setup";
import Arena from "views/admin/arena";
import Reports from "views/admin/reports";

// Icon Imports
import {
  MdHome,
  MdAdd,
  MdChat,
  MdBarChart,
} from "react-icons/md";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "New Negotiation",
    layout: "/admin",
    path: "scenarios",
    icon: <MdAdd className="h-6 w-6" />,
    component: <Scenarios />,
    secondary: true,
  },
  {
    name: "Setup",
    layout: "/admin",
    path: "setup",
    icon: <MdAdd className="h-6 w-6" />,
    component: <Setup />,
    secondary: true,
  },
  {
    name: "Live Arena",
    layout: "/admin",
    icon: <MdChat className="h-6 w-6" />,
    path: "arena",
    component: <Arena />,
  },
  {
    name: "Reports",
    layout: "/admin",
    path: "reports",
    icon: <MdBarChart className="h-6 w-6" />,
    component: <Reports />,
  },
];
export default routes;
