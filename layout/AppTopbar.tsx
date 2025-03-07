/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { classNames } from "primereact/utils";
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { AppTopbarRef } from "@/types";
import { LayoutContext } from "./context/layoutcontext";
import { localStorageService } from "@/app/service/localStorage";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
  const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } =
    useContext(LayoutContext);
  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);
  const toast = useRef<any>(null);
  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  const router = useRouter();
  const checkAuth = () => {
    const auth = localStorageService.getAuth("auth");
    if (auth) {
      return;
    } else {
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    // checkAuth();
  }, []);

  const onSignOut = () => {
    localStorageService.clearAuth("auth");
    checkAuth();
    toast?.current?.show({
      severity: "error",
      summary: "Logout successfully",
      detail: "Come back anytime",
      life: 3000,
    });
  };

  return (
    <div className="layout-topbar">
      <Toast ref={toast} />
      <Link href="/" className="layout-topbar-logo">
        <span>EMI Inventory</span>
      </Link>

      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars" />
      </button>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible,
        })}
      >
        {/* <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-calendar"></i>
                    <span>Calendar</span>
                </button>
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button> */}

        <button
          type="button"
          className="p-link layout-topbar-button"
          onClick={onSignOut}
        >
          <i className="pi pi-sign-out"></i>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
