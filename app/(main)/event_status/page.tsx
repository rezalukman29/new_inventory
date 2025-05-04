"use client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";
import { InventoryService } from "@/app/service/InventoryService";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import { Toast } from "primereact/toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";

interface ISelect {
  label: string;
  value: string;
}

const TableDemo = () => {
  const toast = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [listEvent, setListEvent] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [height] = useDeviceSize();
  const [page, setPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [status, setStatus] = useState<any | null>(null);
  const [gudangs, setGudangs] = React.useState<any>([]);
  const [listArea, setListArea] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [productDialog, setProductDialog] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const formik = useFormik<any>({
    initialValues: {
      id: isModify ? status.id : "",
      name: isModify ? status.name : "",
      is_show_scan_result: isModify ? status.is_show_scan_result : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const payload: any = {
        id: values.id,
        name: values.name,
        is_show_scan_result: values.is_show_scan_result,
      };
      if (isModify) {
        const result: APIResponse<any> = await InventoryService.putEventStatus({
          ...payload,
          id: status.id,
        });
        if (result.success) {
          setTimeout(() => {
            setProductDialog(false);
          }, 200);
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Modify event status",
            life: 3000,
          });
        }
      } else {
        return;
      }
      setIsModify(false);
      setIsLoading(false);
      formik.resetForm();
      getListSubArea();
    },
  });

  const getListSubArea = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getEventStatus();
      setStatusList(response.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const onDeleteEvent = async (id: string) => {
    try {
      setIsLoading(true);
      await InventoryService.deleteSubArea(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete event",
        life: 3000,
      });
      getListSubArea();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const renderHeader1 = () => {
    return (
      <div className="flex justify-content-between">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Keyword Search"
          />
        </span>
      </div>
    );
  };

  const header1 = renderHeader1();

  useEffect(() => {
    getListSubArea();
  }, []);

  const hideDialog = () => {
    setProductDialog(false);
    setIsModify(false);
  };

  const productDialogFooter = (
    <>
      <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
      <Button
        label="Save"
        icon="pi pi-check"
        text
        onClick={() => formik.handleSubmit()}
      />
    </>
  );

  let [over, setOver] = React.useState("");

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Event Status</h5>
          <DataTable
            value={statusList.filter(
              (el: any) =>
                el.name && el.name.match(new RegExp(searchValue, "i"))
            )}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={statusList.length}
            dataKey="id"
            totalRecords={statusList.length}
            lazy
            first={first}
            alwaysShowPaginator
            loading={isLoading}
            responsiveLayout="scroll"
            emptyMessage="No customers found."
            header={header1}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="{first} to {last} of {totalRecords} events"
          >
            <Column
              field="name"
              header="Status"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="Show Scan"
              header="Show Scan"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              body={(data) => {
                return <p>{data.is_show_scan_result === 0 ? "No" : "Yes"}</p>;
              }}
            />
            <Column
              field="address"
              header="Action"
              headerStyle={{ justifyItems: "center" }}
              bodyStyle={{ textAlign: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              body={(data) => (
                <div
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flex: 1,
                  }}
                >
                  <div
                    onClick={() => {
                      setIsModify(true);
                      setStatus(data);
                      setProductDialog(true);
                    }}
                    onMouseOver={() => setOver(data.id + "edit")}
                    onMouseOut={() => setOver("")}
                    className="pi pi-file-edit"
                    style={{
                      fontSize: 18,
                      cursor: "pointer",
                      color: over === data.id + "edit" ? "blue" : undefined,
                    }}
                  ></div>
                </div>
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
          <Dialog
            visible={productDialog}
            style={{ width: "450px" }}
            header={isModify ? "Modify Warehouse" : "Add Warehouse"}
            modal
            className="p-fluid"
            footer={productDialogFooter}
            onHide={hideDialog}
          >
            <div className="field">
              <label htmlFor="name">Name</label>
              <InputText
                id="name"
                value={formik.values.name}
                onChange={(e) => formik.setFieldValue("name", e.target.value)}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.name ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="field" style={{ flexDirection: "column" }}>
              <label htmlFor="name" style={{ width: "100%" }}>
                Show Scan Result
              </label>
              <InputSwitch
                checked={formik.values.is_show_scan_result === 1 ? true : false}
                onChange={(e) =>
                  formik.setFieldValue(
                    "is_show_scan_result",
                    formik.values.is_show_scan_result === 1 ? 0 : 1
                  )
                }
              />
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
