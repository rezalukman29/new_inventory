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
import { Dialog } from "primereact/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { ConfirmDialog } from "primereact/confirmdialog";
import "../index.css";
import { SortType } from "@/app/interfaces/interfaces";
import useAccountController from "../useAccountController";
import useWindowDimensions from "@/app/hooks/useWindowDimensions";
import { isValidUrl, noImage } from "@/app/util/function";
import { STORAGE_BOOQABLE } from "@/app/util/config";
import { classNames } from "primereact/utils";

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
  const [pageItem, setPageItem] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [firstItem, setFirstItem] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [gudang, setGudang] = useState<any | null>(null);
  const [gudangs, setGudangs] = React.useState<any>([]);
  const [productDialog, setProductDialog] = useState(false);
  const [selected, setSelecetd] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchValueItem, setSearchValueItem] = useState<string>("");
  let [over, setOver] = React.useState("");
  const [sort, setSort] = useState<SortType>("ASC");
  const [sortBy, setSortBy] = useState<string>("nama");
  const [sortItem, setSortItem] = useState<SortType>("ASC");
  const [sortByItem, setSortByItem] = useState<string>("nama_barang");
  const [totalPagesItem, setTotalPagesItem] = useState<number>(10);
  const [totalItem, setTotalItem] = useState<number>(10);
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<any[]>([]);

  const formik = useFormik<any>({
    initialValues: {
      nama: isModify ? gudang.nama : "",
      lokasi: isModify ? gudang.lokasi : "",
      pic: isModify ? gudang.pic : "",
    },
    validationSchema: Yup.object({
      nama: Yup.string().required("Required"),
      lokasi: Yup.string().required("Required"),
      pic: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setProductDialog(false);
      setIsLoading(true);
      const payload: any = {
        nama: values.nama,
        lokasi: values.lokasi,
        pic: values.pic,
      };
      if (isModify) {
        const result: APIResponse<any> = await InventoryService.editGudang({
          ...payload,
          id: gudang.id,
        });
        if (result.success) {
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Modify warehouse",
            life: 3000,
          });
        }
      } else {
        const result: APIResponse<any> = await InventoryService.addGudang(
          payload
        );
        if (result.success) {
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Adding warehouse",
            life: 3000,
          });
        }
      }
      setIsModify(false);
      setIsLoading(false);
      formik.resetForm();
      getGudang();
    },
  });

  const onChangeStatus = (e: any) => {
    setSelectedStatus(e.target.value);
  };
  const getGudang = async () => {
    try {
      setIsLoading(true);
      const response: any = await InventoryService.getGudang();
      setGudangs(response.data.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const onDeleteEvent = async (id: string) => {
    try {
      setDeleteConfirmation(false);
      setIsLoading(true);
      await InventoryService.deleteGudang(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete event",
        life: 3000,
      });
      getGudang();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getGudang();
  }, [page, sort, sortBy]);

  useEffect(() => {
    if (!!selected) {
      getItems(selected?.id);
    }

  }, [pageItem, sortItem, sortByItem]);

  const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const onSortItem = (field: string) => {
    setSortByItem(field);
    setSortItem(sort === "ASC" ? "DESC" : "ASC");
  };

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

  const renderHeader2 = () => {
    return (
      <div className="flex justify-content-between">
        <span className="p-input-icon-left p-input-icon-right mr-4">
          <i className="pi pi-search" />
          <InputText
            value={searchValueItem}
            onChange={(e) => setSearchValueItem(e.target.value)}
            placeholder="Keyword Search"
          />
          {searchValue && (
            <i
              onClick={() => setSearchValueItem("")}
              className="pi pi-times cursor-pointer"
            />
          )}
        </span>
      </div>
    );
  };

  const header1 = renderHeader1();

  const header2 = renderHeader2();

  const hideDialog = () => {
    setProductDialog(false);
    setIsModify(false);
  };

  const productDialogFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        severity="danger"
        onClick={hideDialog}
        className="button"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        severity="success"
        onClick={() => formik.handleSubmit()}
        className="button"
      />
    </>
  );

  const getItems = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getBarangGudang(
        id,
        pageItem,
        searchValueItem,
        5,
        sortItem,
        sortByItem
      );
      setItems(response.data);
      setTotalItem(response.total_records);
      setTotalPagesItem(response.total_pages);
      setIsLoading(false);
      setDeleteConfirmation(true);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const inventoryImage = (item: any) => {
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
          <h5>Warehouse</h5>
          <ConfirmDialog
            visible={deleteConfirmation}
            style={{ width: items?.length ? width * 0.9 : undefined }}
            onHide={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
            message={
              items?.length ? (
                <div style={{ flex: 1 }}>
                  <p>Inventory in this warehouse</p>
                  <DataTable
                    value={items}
                    paginator
                    className="p-datatable-gridlines"
                    onPage={(e) => {
                      setFirstItem(e.first);
                      setPageItem(Number(e.page) + 1);
                    }}
                    rows={5}
                    dataKey="id"
                    lazy
                    totalRecords={totalItem}
                    tableStyle={{ width: width * 0.88, fontSize: 13 }}
                    first={firstItem}
                    alwaysShowPaginator
                    loading={isLoading}
                    scrollable
                    responsiveLayout="scroll"
                    emptyMessage="No inventory found."
                    header={header2}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} to {last} of {totalRecords} warehouse inventory"
                    onSort={(e) => onSortItem(e.sortField)}
                    sortField={sortByItem}
                    sortOrder={sortItem === "ASC" ? 1 : -1}
                  >
                    <Column
                      field="nama_barang"
                      header="Name"
                      headerStyle={{ justifyItems: "center" }}
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      bodyClassName={classNames({ "font-bold": true })}
                      frozen
                      sortable
                      sortField="nama_barang"
                    />
                    <Column
                      field="stok_gudang"
                      header="Warehouse Stock"
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      headerStyle={{ justifyItems: "center" }}
                      bodyStyle={{ textAlign: "center" }}
                      sortable
                      sortField="stok_gudang"
                    />
                    <Column
                      field="gudang_name"
                      header="Warehouse Name"
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      headerStyle={{ justifyItems: "center" }}
                      bodyStyle={{ textAlign: "center" }}
                      sortable
                      sortField="gudang_name"
                    />
                    <Column
                      field="stok_barang"
                      header="Item Stock"
                      headerStyle={{ justifyItems: "center" }}
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      bodyStyle={{ textAlign: "center" }}
                      sortable
                      sortField="stok_barang"
                    />
                    <Column
                      field="stok_minimum"
                      header="Stok Min"
                      headerStyle={{ justifyItems: "center" }}
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      bodyStyle={{ textAlign: "center" }}
                      sortable
                      sortField="stok_minimum"
                    />
                    <Column
                      field="stock_used"
                      header="Stok Used"
                      headerStyle={{ justifyItems: "center" }}
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      bodyStyle={{ textAlign: "center" }}
                      sortable
                      sortField="stock_used"
                    />
                    <Column
                      field="stock_used"
                      header="Minimum Status"
                      headerStyle={{ justifyItems: "center" }}
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      bodyStyle={{ textAlign: "center" }}
                      body={(data) => {
                        const isLow = data.stok_gudang < data.stok_minimum;
                        const isNotSet =
                          data.stok_minimum === 0 || !data.stok_minimum;
                        const isSafe = data.stok_gudang >= data.stok_minimum;
                        return (
                          <Button
                            label={
                              isLow ? "Low" : isNotSet ? "Not Set" : "Safe"
                            }
                            outlined
                            severity={
                              isLow
                                ? "danger"
                                : isNotSet
                                ? "secondary"
                                : "success"
                            }
                            className="button"
                          />
                        );
                      }}
                    />

                    <Column
                      field="stok_minimum"
                      header="Image"
                      headerStyle={{ justifyItems: "center" }}
                      filterPlaceholder="Search by name"
                      style={{
                        minWidth: "4rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      body={inventoryImage}
                      bodyStyle={{ padding: 4, textAlign: "center" }}
                      sortable
                      sortField="stok_minimum"
                    />
                    <Column
                      field="updated_at"
                      header="Updated At"
                      filterPlaceholder="Search by name"
                      style={{ maxWidth: "9rem" }}
                      body={(data: any) => (
                        <p>
                          {data.updated_at
                            ? moment(data.updated_at as any).format(
                                "D MMM YYYY, HH:MM"
                              )
                            : "-"}
                        </p>
                      )}
                      sortable
                      sortField="updated_at"
                    />
                  </DataTable>
                </div>
              ) : (
                `Are you sure you want to delete warehouse ${selected?.nama}?`
              )
            }
            header="Delete Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => onDeleteEvent(selected.id)}
            reject={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
          />
          <DataTable
            value={gudangs.filter(
              (el: any) =>
                el.nama && el.nama.match(new RegExp(searchValue, "i"))
            )}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={pageSize}
            dataKey="id"
            totalRecords={gudangs.length}
            tableStyle={{ fontSize: 13 }}
            first={first}
            alwaysShowPaginator
            loading={isLoading}
            responsiveLayout="scroll"
            emptyMessage="No customers found."
            header={header1}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="{first} to {last} of {totalRecords} warehouse"
            onSort={(e) => onSort(e.sortField)}
            sortField={sortBy}
            sortOrder={sort === "ASC" ? 1 : -1}
          >
            <Column
              field="nama"
              header="Name"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="nama"
            />
            <Column
              field="lokasi"
              header="Location"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="lokasi"
            />
            <Column
              field="pic"
              header="PIC"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="pic"
            />
            <Column
              field="created_at"
              header="Created At"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p>
                  {moment(data.created_at as any).format("D MMM YYYY, HH:MM")}
                </p>
              )}
              sortable
              sortField="created_at"
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
                style={{ width: 100, paddingTop: 8, paddingBottom: 8 }}
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
                      className="pi pi-file-edit"
                      onMouseOver={() => setOver(data.id + "edit")}
                      onMouseOut={() => setOver("")}
                      onClick={() => {
                        setIsModify(true);
                        setGudang(data);
                        setProductDialog(true);
                      }}
                      style={{
                        fontSize: 18,
                        cursor: "pointer",
                        color: over === data.id + "edit" ? "blue" : undefined,
                      }}
                    ></div>

                    <div
                      className="pi pi-trash"
                      onMouseOver={() => setOver(data.id + "delete")}
                      onMouseOut={() => setOver("")}
                      onClick={() => {
                        setSelecetd(data);
                        getItems(data.id);
                      }}
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
                value={formik.values.nama}
                onChange={(e) => formik.setFieldValue("nama", e.target.value)}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.nama ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Location</label>
              <InputText
                id="name"
                value={formik.values.lokasi}
                onChange={(e) => formik.setFieldValue("lokasi", e.target.value)}
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.lokasi ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="field">
              <label htmlFor="name">PIC</label>
              <InputText
                id="name"
                value={formik.values.pic}
                onChange={(e) => formik.setFieldValue("pic", e.target.value)}
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.pic ? "border-red-600" : "border-gray-300"
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
