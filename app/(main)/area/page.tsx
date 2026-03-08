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
import { useRouter } from "next/navigation";
import { SortType } from "@/app/interfaces/interfaces";
import "../index.css";
import useAccountController from "../useAccountController";
import useWindowDimensions from "@/app/hooks/useWindowDimensions";
import { isValidUrl, noImage } from "@/app/util/function";
import { STORAGE_BOOQABLE } from "@/app/util/config";

const TableDemo = () => {
  const router = useRouter();
  const toast = useRef<any>(null);
  const { isAdmin } = useAccountController();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [listArea, setListArea] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
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
  const [searchValue, setSearchValue] = useState<string>("");
  const [sort, setSort] = useState<SortType>("ASC");
  const [sortBy, setSortBy] = useState<string>("name");
  const { width } = useWindowDimensions();
  const formik = useFormik<any>({
    initialValues: {
      name: isModify ? selected.name : "",
      description: isModify ? selected.description : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const payload: any = {
        name: values.name,
        description: values.description,
      };
      if (isModify) {
        const result: APIResponse<any> = await InventoryService.editArea({
          ...payload,
          id: selected.id,
        });
        if (result.success) {
          setTimeout(() => {
            setProductDialog(false);
          }, 200);
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Modify Area",
            life: 3000,
          });
        }
      } else {
        const result: APIResponse<any> = await InventoryService.addArea(
          payload
        );
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
      getListArea();
    },
  });

  const getListArea = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getArea({ sort, sortBy });
      setListArea(response.data.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const getItems = async (area_id: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getDeletedItems({ area_id });
      setItems(response.data);
      setIsLoading(false);
      setDeleteConfirmation(true);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const onDeleteEvent = async (id: string) => {
    try {
      setDeleteConfirmation(false);
      setIsLoading(true);
      await InventoryService.deleteArea(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete event",
        life: 3000,
      });
      getListArea();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListArea();
  }, [sort, sortBy]);

  const onGlobalFilterChange1 = () => {};

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

  const hideDialog = () => {
    setProductDialog(false);
    setIsModify(false);
  };

  const productDialogFooter = (
    <>
      <Button
        label="Cancel"
        severity="danger"
        icon="pi pi-times"
        onClick={hideDialog}
        className="button"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        severity="success"
        style={{ width: 120 }}
        onClick={() => formik.handleSubmit()}
        className="button"
      />
    </>
  );

  let [over, setOver] = React.useState("");

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const itemImage = (item: any) => {
    return (
      <img
        src={
          isValidUrl(item.photo) &&
          item.photo.includes("http://66.42.48.163:9000")
            ? item?.photo?.replace(
                "http://66.42.48.163:9000/booqable/",
                STORAGE_BOOQABLE
              )
            : item.photo
            ? `https://democreation.site/home/public/${item.photo}`
            : noImage
        }
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          cursor: "pointer",
        }}
      />
    );
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Area</h5>
          <ConfirmDialog
            visible={deleteConfirmation}
            style={{ width: items?.length ? width * 0.7 : undefined }}
            onHide={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
            message={
              items?.length ? (
                <div style={{ flex: 1 }}>
                  <p>Event items placed in this area</p>
                  <DataTable
                    value={items ?? []}
                    paginator
                    rows={5}
                    // rowsPerPageOptions={[5, 10, 25, 50]}
                    tableStyle={{ width: width * 0.65 }}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  >
                    <Column
                      field="barang.nama"
                      header="Photo"
                      style={{ width: "10%" }}
                      body={itemImage}
                    ></Column>
                    <Column
                      field="nama_barang"
                      header="Name"
                      style={{ width: "40%" }}
                    ></Column>
                    <Column
                      field={"qty"}
                      header="Qty"
                      bodyStyle={{ textAlign: "center" }}
                      headerStyle={{ justifyItems: "center" }}
                      style={{ width: "10%" }}
                    ></Column>
                    <Column
                      field="gudang[0].nama"
                      header="Warehouse"
                      style={{ width: "20%" }}
                      body={(data) => {
                        return <p>{data?.gudang?.length ? data?.gudang[0]?.nama : "-"}</p>;
                      }}
                    ></Column>
                    <Column
                      field="event.name"
                      header="Event"
                      style={{ width: "20%" }}
                    ></Column>
                  </DataTable>
                </div>
              ) : (
                `Are you sure you want to delete area ${selected?.name}?`
              )
            }
            header="Delete Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => onDeleteEvent(selected.id)}
            reject={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
            children={
              <div style={{ flex: 1 }}>
                <p> oke</p>
                <DataTable
                  value={items ?? []}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  tableStyle={{ width: 300, fontSize: 13 }}
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                >
                  <Column
                    field="barang.nama"
                    header="Photo"
                    style={{ width: "10%" }}
                    body={itemImage}
                  ></Column>
                  <Column
                    field="nama_barang"
                    header="Name"
                    style={{ width: "30%" }}
                  ></Column>
                  <Column
                    field={"qty"}
                    header="Qty"
                    bodyStyle={{ textAlign: "center" }}
                    headerStyle={{ justifyItems: "center" }}
                    style={{ width: "10%" }}
                  ></Column>
                  <Column
                    field="gudang.name"
                    header="Warehouse"
                    headerStyle={{ justifyItems: "center" }}
                    bodyStyle={{ textAlign: "center" }}
                    style={{ width: "20%" }}
                  ></Column>
                  <Column
                    field="event.name"
                    header="Event"
                    style={{ width: "30%" }}
                  ></Column>
                </DataTable>
              </div>
            }
          />
          <DataTable
            value={listArea.filter(
              (el) => el.name && el.name.match(new RegExp(searchValue, "i"))
            )}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={listArea.length}
            dataKey="id"
            totalRecords={listArea.length}
            lazy
            tableStyle={{ fontSize: 13 }}
            first={first}
            alwaysShowPaginator
            loading={isLoading}
            responsiveLayout="scroll"
            emptyMessage="No customers found."
            header={header1}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="{first} to {last} of {totalRecords} events"
            onSort={(e) => onSort(e.sortField)}
            sortField={sortBy}
            sortOrder={sort === "ASC" ? 1 : -1}
          >
            <Column
              field="name"
              header="Name"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="name"
            />
            <Column
              field="description"
              header="Description"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="description"
            />
            <Column
              field="total_sub_area"
              header="Sub Area"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
            />
            <Column
              field="created_at"
              header="Created At"
              sortable
              sortField="created_at"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p>
                  {moment(data.created_at as any).format("D MMM YYYY, HH:MM")}
                </p>
              )}
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
                style={{ width: 130, paddingTop: 8, paddingBottom: 8 }}
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
                      onClick={(e) => router.push(`/sub_area?id=${data.id}`)}
                      className="pi pi-folder"
                      style={{ fontSize: 18, cursor: "pointer" }}
                    ></div>
                    <div
                      className="pi pi-file-edit"
                      onClick={() => {
                        setIsModify(true);
                        setSelecetd(data);
                        setProductDialog(true);
                      }}
                      onMouseOver={() => setOver(data.id + "edit")}
                      onMouseOut={() => setOver("")}
                      style={{
                        fontSize: 18,
                        marginLeft: 20,
                        cursor: "pointer",
                        color: over === data.id + "edit" ? "blue" : undefined,
                      }}
                    ></div>

                    <div
                      className="pi pi-trash"
                      onClick={() => {
                        setSelecetd(data);
                        getItems(data.id);
                      }}
                      onMouseOver={() => setOver(data.id + "delete")}
                      onMouseOut={() => setOver("")}
                      style={{
                        fontSize: 18,
                        marginLeft: 20,
                        cursor: "pointer",
                        color: over === data.id + "delete" ? "blue" : undefined,
                      }}
                    ></div>
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
            header={isModify ? "Modify Area" : "Add Area"}
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
            <div className="field">
              <label htmlFor="name">Description</label>
              <InputText
                id="name"
                value={formik.values.description}
                onChange={(e) =>
                  formik.setFieldValue("description", e.target.value)
                }
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.description
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
