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
import { ConfirmDialog } from "primereact/confirmdialog";

import "../index.css";
import useAccountController from "../useAccountController";
import { Dropdown } from "primereact/dropdown";
import moment from "moment";
import Label from "@/app/components/atoms/Label";
import { styles } from "../styles";

interface ISelect {
  label: string;
  value: string;
}

const TableDemo = () => {
  const toast = useRef<any>(null);
  const { isAdmin } = useAccountController();
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
  const [selected, setSelecetd] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

  const formik = useFormik<any>({
    initialValues: {
      id: isModify ? status.id : "",
      name: isModify ? status.name : "",
      order_data: isModify ? status.order_data : "",
      action: isModify ? status.action : "",
      is_show_scan_result: isModify ? status.is_show_scan_result : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      order_data: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const payload: any = {
        name: values.name,
        is_show_scan_result: values.is_show_scan_result,
        order_data: Number(values.order_data),
        action: values.action,
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
        const result: APIResponse<any> = await InventoryService.addEventStatus({
          ...payload,
          is_show_scan_result: Number(payload.is_show_scan_result),
        });
        if (result.success) {
          setTimeout(() => {
            setProductDialog(false);
          }, 200);
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Adding Area",
            life: 3000,
          });
        }
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
      setStatusList(response.data.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const onDeleteEvent = async (id: string) => {
    try {
      setIsLoading(true);
      await InventoryService.deleteStatus(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete Event Status",
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
        <span className="p-input-icon-left p-input-icon-right mr-4">
          <i className="pi pi-search" />
          <InputText
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Keyword Search"
          />
          {searchValue && (
            <i
              onClick={() => setSearchValue("")}
              className="pi pi-times cursor-pointer"
            />
          )}
        </span>
        {isAdmin && (
          <Button
            label="New"
            icon="pi pi-plus"
            severity="success"
            className="button mr-2"
            onClick={() => setProductDialog(true)}
          />
        )}
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
          <Button
        label="Cancel"
        icon="pi pi-times"
        style={{
          width: 120,
          color: "#3B3b3B",
          backgroundColor: "transparent",
          borderColor: "#C4C4C4",
        }}
        onClick={hideDialog}
        className="button"
      />
      <Button
        label="Save Event Status"
        icon="pi pi-check"
        style={{ width: 180 }}
        onClick={() => formik.handleSubmit()}
        className="button"
      />

    </>
  );

  let [over, setOver] = React.useState("");

  return (
    <div className="grid">
      <div className="sub-header">
        <h5>Event Status</h5>
      </div>
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <ConfirmDialog
            visible={deleteConfirmation}
            onHide={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
            message={`Are you sure you want to delete status ${selected?.name}?`}
            header="Delete Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => onDeleteEvent(selected.id)}
            reject={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
          />
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
              field="order_data"
              header="Order"
              filterPlaceholder="Search by name"
              style={{ minWidth: "1rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="order_data"
            />
            <Column
              field="name"
              header="Status"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="name"
            />
            <Column
              field="Show Scan"
              header="Show Scan"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data) => {
                return <p>{data.is_show_scan_result === 0 ? "No" : "Yes"}</p>;
              }}
              sortable
              sortField="is_show_scan_result"
            />
            <Column
              field="action"
              header="Action"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="action"
            />
            <Column
              field="active_event"
              header="Event Running"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="active_event"
            />
            <Column
              field="updated_at"
              header="Updated At"
              filterPlaceholder="Search by name"
              style={{ maxWidth: "9rem" }}
              body={(data: any) => (
                <p>
                  {data.updated_at
                    ? moment(data.updated_at as any).format("D MMM YYYY, HH:MM")
                    : "-"}
                </p>
              )}
              sortable
              sortField="updated_at"
            />
            {isAdmin && (
              <Column
                field="address"
                header="Action"
                headerStyle={{ justifyItems: "center" }}
                bodyStyle={{ textAlign: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
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
                        fontSize: 16,
                        cursor: "pointer",
                        color: over === data.id + "edit" ? "blue" : undefined,
                      }}
                    ></div>
                    {data.active_event === 0 ? (
                      <div
                        className="pi pi-trash"
                        onClick={() => {
                          setSelecetd(data);
                          setDeleteConfirmation(true);
                        }}
                        onMouseOver={() => setOver(data.id + "delete")}
                        onMouseOut={() => setOver("")}
                        style={{
                          fontSize: 16,
                          marginLeft: 20,
                          cursor: "pointer",
                          color:
                            over === data.id + "delete" ? "blue" : undefined,
                        }}
                      ></div>
                    ) : null}
                  </div>
                )}
              />
            )}
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
            header={isModify ? "Modify Event Status" : "Add Event Status"}
            modal
            className="custom-dialog p-fluid"
            footer={productDialogFooter}
            onHide={hideDialog}
          >
            <div className="field mt-4">
              <Label title="Order" isRequired />
              <InputText
                id="name"
                value={formik.values.order_data}
                onChange={(e) =>
                  formik.setFieldValue("order_data", e.target.value)
                }
                autoFocus
                type="number"
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.order_data
                    ? "border-red-600"
                    : "border-gray-300"
                } `}
                style={styles.textInput}
              />
            </div>
            <div className="field">
              <Label title="Name" isRequired />
              <InputText
                id="name"
                value={formik.values.name}
                onChange={(e) => formik.setFieldValue("name", e.target.value)}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.name ? "border-red-600" : "border-gray-300"
                } `}
                style={styles.textInput}
              />
            </div>
            <div className="field">
              <Label title="Action" />
              <Dropdown
                onChange={(e) => formik.setFieldValue("action", e.target.value)}
                value={formik.values.action}
                options={[
                  {
                    label: "Nothing",
                    value: "",
                  },
                  {
                    label: "Scan In",
                    value: "SCAN IN",
                  },
                  {
                    label: "Scan Out",
                    value: "SCAN OUT",
                  },
                ]}
                optionLabel="label"
                placeholder="Select status"
                className={`custom-dropdown flex-1 ${
                  formik.errors.action ? "border-red-600" : "border-gray-300"
                }`}
                style={styles.textInput}
              />
            </div>
            <div className="field" style={{ flexDirection: "column" }}>
              <Label title="Show Scan Result" />
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
