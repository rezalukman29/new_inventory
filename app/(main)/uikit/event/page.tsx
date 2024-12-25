"use client";
import { CustomerService } from "../../../../demo/service/CustomerService";
import { ProductService } from "../../../../demo/service/ProductService";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import {
  Column,
  ColumnFilterApplyTemplateOptions,
  ColumnFilterClearTemplateOptions,
  ColumnFilterElementTemplateOptions,
} from "primereact/column";
import {
  DataTable,
  DataTableExpandedRows,
  DataTableFilterMeta,
} from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { ProgressBar } from "primereact/progressbar";
import { Rating } from "primereact/rating";
import { Slider } from "primereact/slider";
import { ToggleButton } from "primereact/togglebutton";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { classNames } from "primereact/utils";
import React, { useEffect, useRef, useState } from "react";
import type { Demo } from "@/types";
import { InventoryService } from "@/app/service/InventoryService";
import { isValidUrl, noImage } from "@/app/util/function";
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
  const [productDialog, setProductDialog] = useState(false);
  const [showStart, setShowStart] = useState<boolean>(false);
  const [showEnd, setShowEnd] = useState<boolean>(false);

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
      const response = await InventoryService.getEvent({
        page,
        limit: size ?? pageSize,
      });
      setListEvent(response.data);
      setTotal(response.total_records);
      setTotalPages(response.total_pages);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setPage(1);
      setFirst(0);
    }
  };

  const onDeleteEvent = async (id: string) => {
    try {
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
  }, [page]);

  const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {};

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

  const header1 = renderHeader1();

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Event</h5>
          <DataTable
            value={listEvent}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={pageSize}
            dataKey="id"
            totalRecords={total}
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
              header="Name"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="description"
              header="Description"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="event_start"
              header="Start"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem" }}
              body={(data: any) => (
                <p>{moment(data.event_start as any).format("LLL")}</p>
              )}
            />
            <Column
              field="event_end"
              header="Finish"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem" }}
              body={(data: any) => (
                <p>{moment(data.event_end as any).format("LLL")}</p>
              )}
            />
            <Column
              field="event_code"
              header="Code"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="address"
              header="Location"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="address"
              header="Action"
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
                    className="pi pi-file-edit"
                    style={{ fontSize: 18, cursor: "pointer" }}
                  ></div>

                  <div
                    className="pi pi-trash"
                    onClick={() => onDeleteEvent(data.id)}
                    style={{ fontSize: 18, marginLeft: 8, cursor: "pointer" }}
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
