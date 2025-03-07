/* eslint-disable @next/next/no-img-element */

import React, { useContext } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";
import Link from "next/link";
import { AppMenuItem } from "@/types";

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);

  const model: AppMenuItem[] = [
    {
      label: "Home",
      items: [
        { label: "Dashboard", icon: "pi pi-list", to: "/" },
        {
          label: "Event",
          icon: "pi pi-calendar",
          to: "/uikit/event",
        },
        {
          label: "Inventory",
          icon: "pi pi-fw pi-id-card",
          to: "/uikit/inventory",
        },
        {
          label: "Warehouse",
          icon: "pi pi-home",
          to: "/uikit/warehouse",
        },
        {
          label: "Warehouse Inventory",
          icon: "pi pi-file-import",
          to: "/uikit/warehouse_inventory",
        },
        {
          label: "Event Inventory",
          icon: "pi pi-database",
          to: "/uikit/event-item-list",
        },
        {
          label: "Sync Inventory",
          icon: "pi pi-sync",
          to: "/uikit/sync",
        },
        {
          label: "Area",
          icon: "pi pi-map-marker",
          to: "/uikit/area",
        },
        {
          label: "Sub Area",
          icon: "pi pi-comment",
          to: "/uikit/sub_area",
        },
        {
          label: "Event Status",
          icon: "pi pi-flag",
          to: "/uikit/event_status",
        },
        {
          label: "Category",
          icon: "pi pi-sitemap",
          to: "/uikit/category",
        },
        {
          label: "Log",
          icon: "pi pi-book",
          to: "/uikit/log",
        },
      ],
    },
   
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) => {
          return !item?.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator"></li>
          );
        })}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
