"use client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";
import { InventoryService } from "@/app/service/InventoryService";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import useGetEventStatus from "@/app/hooks/api/useGetEventStatus";
import moment from "moment";
import { Toast } from "primereact/toast";
import { PayloadAddEventI } from "@/app/interfaces/InventoryInterface";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Day, utils } from "react-modern-calendar-datepicker";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { Dialog } from "primereact/dialog";
import { Calendar } from "@hassanmojab/react-modern-calendar-datepicker";
import "./DatePicker.css";
import { ConfirmDialog } from "primereact/confirmdialog";
import "../index.css";
import { localStorageService } from "@/app/service/localStorage";
import { useRouter } from "next/navigation";
import { SortType } from "@/app/interfaces/interfaces";

interface ISelect {
  label: string;
  value: string;
}

const TableDemo = () => {
  const toast = useRef<any>(null);
  const router = useRouter();
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
  const [productDialog, setProductDialog] = useState(false);
  const [showStart, setShowStart] = useState<boolean>(false);
  const [showEnd, setShowEnd] = useState<boolean>(false);
  const [event, setEvent] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState<SortType>("ASC");
  const [sortBy, setSortBy] = useState<string>("event_name");

  const formik = useFormik<PayloadAddEventI>({
    initialValues: {
      name: "",
      event_code: "",
      description: "",
      event_start: utils("en").getToday(),
      event_end: utils("en").getToday(),
      PIC: "",
      images: "",
      address: "",
      files: "",
      is_complete: 0,
      status: selectedStatus,
      notes: "",
      type: "",
      latitude: "",
      longitude: "",
      event_running: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      event_code: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      PIC: Yup.string().required("Required"),
      notes: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const payload: any = {
        description: values.description,
        name: values.name,
        event_start: `${formik.values.event_start?.year}-${formik.values.event_start?.month}-${formik.values.event_start?.day}`,
        event_end: `${formik.values.event_end?.year}-${formik.values.event_end?.month}-${formik.values.event_end?.day}`,
        PIC: values.PIC,
        event_code: values.event_code,
        is_complete: 0,
        status: selectedStatus,
        images: values.images,
        files: values.files,
        address: values.address,
        type: "",
        latitude: "",
        longitude: "",
        event_running: "",
        notes: values.notes,
      };
      const result: APIResponse<any> = await InventoryService.addEvent(payload);
      if (result.success) {
        setTimeout(() => {
          setProductDialog(false);
        }, 200);
      }
      setIsLoading(false);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Adding event",
        life: 3000,
      });
      getListEvent();
    },
  });

  const onChangeStatus = (e: any) => {
    setSelectedStatus(e.target.value);
  };
  const getListEvent = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getEventInventory({
        page,
        limit: size ?? pageSize,
        search: searchValue,
        sort,
        sortBy,
      });
      setListEvent(response.data);
      setTotal(response.total_records);
      setTotalPages(response.total_pages);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setPage(1);
      setFirst(0);
      setListEvent([]);
      setTotal(0);
      setTotalPages(0);
    }
  };

  const onDeleteEvent = async (id: string) => {
    try {
      setDeleteConfirmation(false);
      setIsLoading(true);
      await InventoryService.deleteEvent({ id });
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete event",
        life: 3000,
      });
      getListEvent();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const { data: eventStatus } = useGetEventStatus({
    options: {
      enabled: true,
    },
  });

  useEffect(() => {
    getListEvent();
  }, [page, sort, sortBy]);

  const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const renderHeader1 = () => {
    return (
      <div className="flex justify-content-between">
        <div className="flex">
          <span className="p-input-icon-left mr-4">
            <i className="pi pi-search" />
            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Keyword Search"
            />
          </span>
          <Button
            label="Search"
            onClick={() => {
              if (page === 1) {
                getListEvent();
              } else {
                setPage(1);
              }
            }}
            className="button"
          />
        </div>
      </div>
    );
  };

  const hideDialog = () => {
    setProductDialog(false);
    setIsModify(false);
  };

  const productDialogFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        onClick={hideDialog}
        className="button"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        text
        onClick={() => formik.handleSubmit()}
        className="button"
      />
    </>
  );

  const header1 = renderHeader1();

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Event Inventory List</h5>
          <ConfirmDialog
            visible={deleteConfirmation}
            onHide={() => {
              setDeleteConfirmation(false);
              setEvent(null);
            }}
            message={`Are you sure you want to delete event ${event?.name}?`}
            header="Delete Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => onDeleteEvent(event.id)}
            reject={() => {
              setDeleteConfirmation(false);
              setEvent(null);
            }}
          />
          <DataTable
            value={listEvent}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            tableStyle={{ fontSize: 13 }}
            rows={pageSize}
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
            currentPageReportTemplate="{first} to {last} of {totalRecords} inventory"
            onSort={(e) => onSort(e.sortField)}
            sortField={sortBy}
            sortOrder={sort === "ASC" ? 1 : -1}
          >
            <Column
              field="event_name"
              header="Event"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p
                  style={{ cursor: "pointer", fontWeight: 'bold' }}
                  onClick={(e) => {
                    localStorageService.clearCart("cart");
                    router.push(`/event-item?event=${data.id}`);
                  }}
                >
                  {data.event_name}
                </p>
              )}
              sortable
              sortField="event_name"
            />
            <Column
              field="event_location"
              header="Location"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="event_location"
            />
            <Column
              field="event_status_id.Int64"
              header="Status"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p>
                  {eventStatus?.data?.data?.find(
                    (el: any) => el.id === data.event_status_id.Int64 + 1
                  )?.name ?? ""}
                </p>
              )}
            />
            <Column
              field="nama_barang"
              header="Item"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="nama_barang"
            />
            <Column
              field="stok_barang.Int64"
              header="Stock Item"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
            />
            <Column
              field="stok_di_keranjang.Int64"
              header="Stock in Cart"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
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
            header={isModify ? "Modify Event" : "Add Event"}
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
              <label htmlFor="name"> Event Code</label>
              <InputText
                id="name"
                value={formik.values.event_code}
                onChange={(e) =>
                  formik.setFieldValue("event_code", e.target.value)
                }
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.event_code
                    ? "border-red-600"
                    : "border-gray-300"
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
            <div className="field">
              <label htmlFor="name"> Event Start</label>
              <InputText
                id="name"
                value={`${formik.values.event_start?.year}-${formik.values.event_start?.month}-${formik.values.event_start?.day}`}
                onFocus={() => {
                  setShowEnd(false);
                  setShowStart(true);
                }}
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.event_start
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
              {showStart && (
                <div className="absolute">
                  <div className="relative mt-2" style={{ width: 320 }}>
                    <Calendar
                      locale={"en"}
                      value={formik.values.event_start}
                      minimumDate={utils("en").getToday()}
                      onChange={(date) => {
                        setShowStart(false);
                        formik.setFieldValue("event_start", date);
                        formik.setFieldValue("event_end", undefined);
                      }}
                      onDisabledDayError={(value) => console.log(value)}
                      colorPrimary="#AB5CFA" // added this
                      calendarClassName="custom-calendar" // and this
                      calendarTodayClassName="custom-today-day" // also this
                      shouldHighlightWeekends
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="field">
              <label htmlFor="name"> Event End</label>
              <InputText
                id="name"
                value={
                  formik.values.event_end
                    ? `${formik.values.event_end?.year}-${formik.values.event_end?.month}-${formik.values.event_end?.day}`
                    : ""
                }
                onFocus={() => {
                  setShowEnd(true);
                  setShowStart(false);
                }}
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.event_end ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
              {showEnd && (
                <div className="absolute">
                  <div className="relative mt-2" style={{ width: 320 }}>
                    <Calendar
                      locale={"en"}
                      value={formik.values.event_end}
                      minimumDate={formik.values.event_start as Day}
                      onChange={(date) => {
                        setShowEnd(false);
                        formik.setFieldValue("event_end", date);
                      }}
                      onDisabledDayError={(value) => console.log(value)}
                      colorPrimary="#AB5CFA" // added this
                      calendarClassName="custom-calendar" // and this
                      calendarTodayClassName="custom-today-day" // also this
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="field">
              <label htmlFor="name">PIC</label>
              <InputText
                id="name"
                value={formik.values.PIC as string}
                onChange={(e) => formik.setFieldValue("PIC", e.target.value)}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.PIC ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Address</label>
              <InputText
                id="name"
                value={formik.values.address}
                onChange={(e) =>
                  formik.setFieldValue("address", e.target.value)
                }
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.address ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Status</label>
              <Dropdown
                onChange={(e) => setSelectedStatus(e.target.value)}
                value={selectedStatus}
                options={eventStatus?.data?.map?.((el: any) => {
                  return {
                    label: el.name,
                    value: el.id,
                  };
                })}
                optionLabel="label"
                placeholder="Select status"
                className="flex-1"
                // style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label htmlFor="notes">Note</label>
              <InputText
                id="notes"
                value={formik.values.notes}
                onChange={(e) => formik.setFieldValue("notes", e.target.value)}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.notes ? "border-red-600" : "border-gray-300"
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
