"use client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";
import { InventoryService } from "@/app/service/InventoryService";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import moment from "moment";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { Dialog } from "primereact/dialog";
import useGetLogActivity, {
  getLogActivity,
} from "@/app/hooks/api/useGetLogActivity";
import useGetEmiUser from "@/app/hooks/api/useGetEmiUser";

const TableDemo = () => {
  const toast = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [height] = useDeviceSize();
  const [page, setPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [gudang, setGudang] = useState<any | null>(null);
  const [gudangs, setGudangs] = React.useState<any>([]);
  const [selected, setSelecetd] = useState<any | null>(null);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

  const { data: users } = useGetEmiUser({
    options: {
      enabled: true,
    },
  });

  const getLogs = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await getLogActivity({
        page,
        limit: size ?? pageSize,
        module: "",
      });
      setLogs(response.data.data);
      setTotal(response.data.total_records);
      setTotalPages(response.data.total_pages);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLogs();
  }, [page]);

  const onGlobalFilterChange1 = () => {};

  const renderHeader1 = () => {
    return (
      <div className="flex justify-content-between">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={""}
            onChange={onGlobalFilterChange1}
            placeholder="Keyword Search"
          />
        </span>
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          className=" mr-2"
          onClick={() => setProductDialog(true)}
        />
      </div>
    );
  };

  const header1 = renderHeader1();

  const hideDialog = () => {
    setProductDialog(false);
    setIsModify(false);
  };

  const getModule = (path: string) => {
    const module = categorize(path);
    switch (module) {
      case "/v1/fix-event-list":
        return "event item";
      case "/v1/event":
        return "event";
      case "/v1/barang":
        return "inventory item";
      case "/v1/gudang":
        return "gudang";
      case "/v1/barang-gudang":
        return "warehouse item";
      case "/v1/area":
        return "area";
      case "/v1/sub-area":
        return "sub area";
      default:
        return "";
    }
  };

  function categorize(url: string) {
    if (url.includes("fix-event-list")) {
      return "/v1/fix-event-list";
    }
    if (url.includes("event")) {
      return "/v1/event";
    }
    if (url.includes("barang-gudang")) {
      return "/v1/barang-gudang";
    }
    if (url.includes("gudang")) {
      return "/v1/gudang";
    }
    if (url.includes("barang")) {
      return "/v1/barang";
    }
    if (url.includes("sub-area")) {
      return "/v1/sub-area";
    }
    if (url.includes("sub-area")) {
      return "/v1/sub-area";
    }
    if (url.includes("area")) {
      return "/v1/area";
    }
    return url;
  }

  function isJSON(str: string) {
    try {
      return JSON.parse(str) && !!str;
    } catch (e) {
      return false;
    }
  }

  const getName = (path: string, payload: string) => {
    const module = categorize(path);
    const isJson = isJSON(payload);
    switch (module) {
      case "/v1/login":
        return isJson ? `"Email: ${JSON.parse(payload)?.email}"` : "";
      case "/v1/fix-event-list":
        return isJson
          ? `"Area id: ${JSON.parse(payload)?.list_id}, Event id: ${
              JSON.parse(payload)?.event_id
            }, Sub area id: ${JSON.parse(payload)?.sub_list_id}"`
          : "";
      case "/v1/event":
        return isJson
          ? `"${JSON.parse(payload)?.name}"`
          : path?.split("/")?.length === 4
          ? `"Event id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/barang":
        return isJson
          ? `"${
              JSON.parse(payload)?.nama ??
              JSON.parse(payload)?.name ??
              `Barang Id: ${JSON.parse(payload)?.id}`
            }"`
          : path?.split("/")?.length === 4
          ? `"Barang id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/barang-gudang":
        return isJson
          ? `"Barang id: ${JSON.parse(payload)?.barang_id}, Stok: ${
              JSON.parse(payload)?.stok
            }, Warehouse id: ${JSON.parse(payload)?.gudang_id}"`
          : "";
      case "/v1/area":
        return isJson
          ? `"${JSON.parse(payload)?.nama ?? JSON.parse(payload)?.name}"`
          : path?.split("/")?.length === 4
          ? `"Area id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/sub-area":
        return isJson
          ? `"${JSON.parse(payload)?.sub_area_name}"`
          : path?.split("/")?.length === 4
          ? `"Sub area id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/gudang":
        return isJson
          ? `"${JSON.parse(payload)?.nama ?? JSON.parse(payload)?.name}"`
          : path?.split("/")?.length === 4
          ? `"Sub area id: ${path?.split("/")[3]}"`
          : "";
      default:
        return "";
    }
  };

  return (
    <div className="grid">
      <div className="sub-header">
        <h5>Log Activity</h5>
      </div>
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <DataTable
            value={logs}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={logs.length}
            dataKey="id"
            totalRecords={total}
            lazy
            first={first}
            alwaysShowPaginator
            loading={isLoading}
            responsiveLayout="scroll"
            emptyMessage="No customers found."
            // header={header1}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="{first} to {last} of {totalRecords} events"
          >
            <Column
              field="name"
              header="User"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              body={(el: any) => (
                <p>
                  {users?.data?.find((item) => item.id === el.user_id)
                    ?.fullname ?? ""}
                </p>
              )}
            />
            <Column
              field="description"
              header="Module"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              body={(el: any) => (
                <p>{`${
                  el.endpoint === "/v1/login"
                    ? "Login"
                    : el.method === "POST"
                    ? "Create"
                    : el.method === "PUT"
                    ? "Update"
                    : "Delete"
                } ${getModule(el.endpoint)} ${getName(
                  el.endpoint,
                  el.payload
                )}`}</p>
              )}
            />
            <Column
              field="created_at"
              header="Action Time"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p>
                  {moment(data.created_at as any).format("D MMM YYYY, HH:MM")}
                </p>
              )}
            />
            {/* <Column
              field="event_end"
              header="Satuan"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem" }}
              body={inventoryImage}
            /> */}
            {/* <Column
              field="satuan.name"
              header="Category"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              body={inventoryCategory}
            />
            <Column
              field="satuan.name"
              header="Category"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              body={inventoryWarehouse}
            /> */}
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
