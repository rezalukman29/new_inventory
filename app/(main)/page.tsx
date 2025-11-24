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
import { SortType } from "@/app/interfaces/interfaces";
import { useRouter } from "next/navigation";
import { localStorageService } from "../service/localStorage";
import { SCAN_TYPE } from "../util/data";
import { Text } from "@/app/components/atoms/Text";
import { Icon } from "@iconify/react";
import "./index.css";
import Loading from "../components/atoms/loading";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import useAccountController from "./useAccountController";
import { classNames } from "primereact/utils";

interface ISelect {
  label: string;
  value: string;
}

const TableDemo = () => {
  const { isAdmin } = useAccountController();
  const toast = useRef<any>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [listEvent, setListEvent] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [width] = useDeviceSize();
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
  const [sort, setSort] = useState<SortType>("DESC");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [base64, setBase64] = useState<string>();

  const datepickerFormat = (value: Date) => {
    return {
      day: moment(value)?.day() + 1,
      month: moment(value)?.month() + 1,
      year: moment(value)?.year(),
    };
  };

  const formik = useFormik<PayloadAddEventI>({
    initialValues: {
      name: isModify ? event?.name : "",
      event_code: isModify ? event?.event_code : "",
      description: isModify ? event?.description : "",
      event_start: isModify
        ? datepickerFormat(event?.event_start)
        : utils("en").getToday(),
      event_end: isModify
        ? datepickerFormat(event?.event_end)
        : utils("en").getToday(),
      PIC: isModify ? event?.PIC : "",
      address: isModify ? event?.address : "",
      files: "",
      is_complete: 0,
      status: isModify ? event?.status : 1,
      notes: isModify ? event?.notes : "",
      type: "",
      latitude: "",
      longitude: "",
      event_running: "",
      scan_type: isModify ? event?.scan_type : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      event_code: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      PIC: Yup.string().required("Required"),
      notes: Yup.string().required("Required"),
      scan_type: Yup.string().required("Required"),
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
        status: values.status,
        files: values.files,
        address: values.address,
        type: "",
        latitude: "",
        longitude: "",
        event_running: "",
        notes: values.notes,
        scan_type: values.scan_type,
      };
      if (isModify) {
        const result: APIResponse<any> = await InventoryService.editEvent({
          ...payload,
          id: event.id,
          ...(base64
            ? { images: base64?.split(",")[1] as string }
            : { images: "" }),
        });
        if (result.success) {
          setTimeout(() => {
            setProductDialog(false);
          }, 200);
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Modify Event",
            life: 3000,
          });
        }
      } else {
        const result: APIResponse<any> = await InventoryService.addEvent({
          ...payload,

          ...(base64
            ? { images: base64?.split(",")[1] as string }
            : { images: "" }),
        });
        if (result.success) {
          setTimeout(() => {
            setProductDialog(false);
          }, 200);
        }
        toast?.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Adding event",
          life: 3000,
        });
      }
      formik.resetForm();
      setBase64("");
      setIsLoading(false);

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

  const convertToBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleProfile = async (e: any) => {
    const file = e.target.files[0];
    if (file?.size / 1024 / 1024 < 2) {
      const base64 = await convertToBase64(file);
      setBase64(base64 as any);
    } else {
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Image size must be of 2MB or less",
        life: 3000,
      });
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

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      if (page === 1) {
        getListEvent();
      } else {
        setPage(1);
      }
    }
  };

  const renderHeader1 = () => {
    return (
      <div className="flex justify-content-between">
        <div className="flex">
          <span className="p-input-icon-left p-input-icon-right mr-4">
            <i className="pi pi-search" />
            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Keyword Search"
              onKeyDown={handleKeyDown}
            />
            {searchValue && (
              <i
                onClick={() => setSearchValue("")}
                className="pi pi-times cursor-pointer"
              />
            )}
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
        style={{ width: 120 }}
        onClick={hideDialog}
        className="button"
      />
      <Button
        label={isModify ? "Update" : "Save"}
        icon="pi pi-check"
        severity="success"
        style={{ width: 120 }}
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
    <>
      {isLoading && <Loading />}
      <div className="grid">
        <Toast ref={toast} />
        <div className="col-12">
          <div className="card">
            <h5>Event</h5>
            <ConfirmDialog
              visible={deleteConfirmation}
              onHide={() => {
                setDeleteConfirmation(false);
                setEvent(null);
                setIsModify(false);
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
            <div style={{ flex: 1, overflowX: "auto", width: width * 0.73 }}>
              <DataTable
                value={listEvent}
                paginator
                className="p-datatable-gridlines"
                onPage={(e) => {
                  setFirst(e.first);
                  setPage(Number(e.page) + 1);
                }}
                tableStyle={{ width: 1800, fontSize: 13 }}
                rows={pageSize}
                dataKey="id"
                totalRecords={total}
                lazy
                scrollable
                first={first}
                alwaysShowPaginator
                loading={false}
                responsiveLayout="scroll"
                emptyMessage="No customers found."
                header={header1}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} to {last} of {totalRecords} events"
                onSort={(e) => onSort(e.sortField)}
                sortField={sortBy}
                sortOrder={sort === "ASC" ? 1 : -1}
                selectionMode={"single"}
              >
                <Column
                  field="id"
                  header="ID"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "2rem" }}
                  sortable
                  sortField="id"
                  frozen
                  bodyClassName={classNames({ 'font-bold': true })}
                />
                <Column
                  field="name"
                  header="Name"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "6rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="name"
                  frozen
                  bodyClassName={classNames({ 'font-bold': true })}
                />
                <Column
                  field="description"
                  header="Description"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "6rem", paddingTop: 8, paddingBottom: 8 }}
                />
                <Column
                  field="event_start"
                  header="Start"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
                  body={(data: any) => (
                    <p>{moment(data.event_start as any).format("LLL")}</p>
                  )}
                  sortable
                  sortField="event_start"
                />
                <Column
                  field="event_end"
                  header="Finish"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
                  body={(data: any) => (
                    <p>{moment(data.event_end as any).format("LLL")}</p>
                  )}
                  sortable
                  sortField="event_end"
                />
                <Column
                  field="event_code"
                  header="Code"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="event_code"
                />
                <Column
                  field="address"
                  header="Location"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="address"
                />
                <Column
                  field="scan_type"
                  header="QR Type"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="scan_type"
                />
                {isAdmin && (
                  <Column
                    field="address"
                    header="Action"
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
                          onClick={(e) => {
                            localStorageService.clearCart("cart");
                            router.push(`/event-item?event=${data.id}`);
                          }}
                          className="pi pi-folder"
                          style={{ fontSize: 18, cursor: "pointer" }}
                        ></div>
                        <div
                          className="pi pi-file-edit"
                          style={{
                            fontSize: 18,
                            marginLeft: 20,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setIsModify(true);
                            setEvent(data);
                            setProductDialog(true);
                          }}
                        ></div>

                        <div
                          className="pi pi-trash"
                          onClick={() => {
                            setEvent(data);
                            setDeleteConfirmation(true);
                          }}
                          style={{
                            fontSize: 18,
                            marginLeft: 20,
                            cursor: "pointer",
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
            </div>
            <Dialog
              visible={productDialog}
              style={{ width: "800px" }}
              header={isModify ? "Modify Event" : "Add Event"}
              modal
              className="p-fluid"
              footer={productDialogFooter}
              onHide={hideDialog}
            >
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <label htmlFor="name">Name</label>
                  <InputText
                    id="name"
                    value={formik.values.name}
                    onChange={(e) =>
                      formik.setFieldValue("name", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full py-2 px-4 ${
                      formik.errors.name ? "border-red-600" : "border-gray-300"
                    } rounded-lg bg-transparent`}
                    style={{ height: 44 }}
                  />
                </div>
                <div style={{ width: 16 }} />
                <div className="field flex-1">
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
                    style={{ height: 44 }}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
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
                    style={{ height: 44 }}
                  />
                </div>
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <label htmlFor="name">PIC</label>
                  <InputText
                    id="name"
                    value={formik.values.PIC as string}
                    onChange={(e) =>
                      formik.setFieldValue("PIC", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full py-2 px-4 ${
                      formik.errors.PIC ? "border-red-600" : "border-gray-300"
                    } rounded-lg bg-transparent`}
                    style={{ height: 44 }}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <label htmlFor="name"> Event Start</label>
                  {isModify ? (
                    <Text
                      fontWeight="regular"
                      color="black"
                      label={`${formik.values.event_start?.day}-${formik.values.event_start?.month}-${formik.values.event_start?.year}`}
                      textAlign="left"
                      variant="base"
                    />
                  ) : (
                    <InputText
                      id="name"
                      value={`${formik.values.event_start?.day}-${formik.values.event_start?.month}-${formik.values.event_start?.year}`}
                      onFocus={() => {
                        setShowEnd(false);
                        setShowStart(true);
                      }}
                      className={`text-black border w-full py-2 px-4 ${
                        formik.errors.event_start
                          ? "border-red-600"
                          : "border-gray-300"
                      } rounded-lg bg-transparent`}
                      style={{ height: 44 }}
                    />
                  )}
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
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <label htmlFor="name"> Event End</label>
                  {isModify ? (
                    <Text
                      fontWeight="regular"
                      color="black"
                      label={`${formik.values.event_end?.day}-${formik.values.event_end?.month}-${formik.values.event_end?.year}`}
                      textAlign="left"
                      variant="base"
                    />
                  ) : (
                    <InputText
                      id="name"
                      value={
                        formik.values.event_end
                          ? `${formik.values.event_end?.day}-${formik.values.event_end?.month}-${formik.values.event_end?.year}`
                          : ""
                      }
                      onFocus={() => {
                        setShowEnd(true);
                        setShowStart(false);
                      }}
                      className={`text-black border w-full py-2 px-4 ${
                        formik.errors.event_end
                          ? "border-red-600"
                          : "border-gray-300"
                      } rounded-lg bg-transparent`}
                      style={{ height: 44 }}
                    />
                  )}
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
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <label htmlFor="name">Address</label>
                  <InputText
                    id="name"
                    value={formik.values.address}
                    onChange={(e) =>
                      formik.setFieldValue("address", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full py-2 px-4 ${
                      formik.errors.address
                        ? "border-red-600"
                        : "border-gray-300"
                    } rounded-lg bg-transparent`}
                    style={{ height: 44 }}
                  />
                </div>
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <label htmlFor="name">Status</label>
                  {isModify ? (
                    <Text
                      fontWeight="regular"
                      color="black"
                      label={
                        eventStatus?.data?.find(
                          (el) => el.id === formik.values.status
                        )?.name as string
                      }
                      textAlign="left"
                    />
                  ) : (
                    <Dropdown
                      onChange={(e) =>
                        formik.setFieldValue("status", e.target.value)
                      }
                      value={formik.values.status}
                      options={eventStatus?.data?.map?.((el: any) => {
                        return {
                          label: el.name,
                          value: el.id,
                        };
                      })}
                      optionLabel="label"
                      placeholder="Select status"
                      className={`flex-1 rounded ${
                        formik.errors.status
                          ? "border-red-600"
                          : "border-gray-300"
                      }`}
                      // style={{ width: "100%" }}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <label htmlFor="notes">Note</label>
                  <InputText
                    id="notes"
                    value={formik.values.notes}
                    onChange={(e) =>
                      formik.setFieldValue("notes", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full py-2 px-4 ${
                      formik.errors.notes ? "border-red-600" : "border-gray-300"
                    } rounded-lg bg-transparent`}
                    style={{ height: 44 }}
                  />
                </div>
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <label htmlFor="notes">QR Type</label>
                  <Dropdown
                    onChange={(e) =>
                      formik.setFieldValue("scan_type", e.target.value)
                    }
                    value={formik.values.scan_type}
                    options={SCAN_TYPE}
                    optionLabel="label"
                    placeholder="Select QR Type"
                    className={`flex-1 rounded ${
                      formik.errors.notes ? "border-red-600" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <label htmlFor="notes">Image</label>
                  {base64 ? (
                    <div className="flex flex-row gap-x-4 items-center">
                      <img
                        src={base64}
                        style={{
                          height: 100,
                          width: 180,
                          objectFit: "cover",
                        }}
                      />

                      <Icon
                        icon="entypo:trash"
                        className="cursor-pointer"
                        fontSize={24}
                        color="#000"
                        onClick={() => setBase64("")}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-row items-center gap-x-4">
                        {isModify && event?.images ? (
                          <>
                            {base64 ? (
                              <img
                                src={base64}
                                style={{
                                  height: 100,
                                  width: 180,
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <img
                                src={
                                  event?.images?.includes("66.42.48.163")
                                    ? event?.images?.replace(
                                        "http://66.42.48.163:9000/booqable/",
                                        "https://storage-booqable.emi-project.my.id/booqable/"
                                      )
                                    : event.images
                                    ? `https://democreation.site/home/public/${event?.images}`
                                    : event
                                }
                                style={{
                                  width: 86,
                                  height: 86,
                                  borderRadius: 8,
                                }}
                              />
                            )}
                            <input
                              type="file"
                              style={{ color: "#000" }}
                              className="form-control"
                              onChange={(e) => handleProfile(e)}
                            />
                          </>
                        ) : (
                          <input
                            type="file"
                            style={{ color: "#000" }}
                            className="form-control"
                            onChange={(e) => handleProfile(e)}
                          />
                        )}
                        {/* {isModify && barang.photo && (
                          <Icon
                            icon="entypo:trash"
                            className="cursor-pointer"
                            fontSize={24}
                            color="#000"
                            onClick={() => setBase64("")}
                          />
                        )} */}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableDemo;
