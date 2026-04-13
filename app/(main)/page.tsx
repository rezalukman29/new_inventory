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
import { TabMenu } from "primereact/tabmenu";
import useGetUsers from "../hooks/api/useGetUsers";
import { STORAGE_BOOQABLE } from "../util/config";
import { convertBase64Event, currency } from "../util/function";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Label from "../components/atoms/Label";
import { styles } from "./styles";

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
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [width] = useDeviceSize();
  const [page, setPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [productDialog, setProductDialog] = useState(false);
  const [adminDialog, setAdminDialog] = useState(false);
  const [showStart, setShowStart] = useState<boolean>(false);
  const [showEnd, setShowEnd] = useState<boolean>(false);
  const [showEventLog, setShowEventlog] = useState<boolean>(false);
  const [showDate, setShowDate] = useState<boolean>(false);
  const [event, setEvent] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState<SortType>("DESC");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [base64, setBase64] = useState<string>();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoadingPrint, setIsLoadingPrint] = useState<boolean>(false);
  const [listAdminEvent, setListAdminEvent] = useState<any[]>([]);
  const [pageAdmin, setPageAdmin] = useState<number>(1);
  const [firstAdmin, setFirstAdmin] = useState<number>(0);
  const [pageSizeAdmin, setPageSizeAdmin] = useState<number>(10);
  const [totalPagesAdmin, setTotalPagesAdmin] = useState<number>(10);
  const [totalAdmin, setTotalAdmin] = useState<number>(10);
  const [sortAdmin, setSortAdmin] = useState<SortType>("DESC");
  const [sortByAdmin, setSortByAdmin] = useState<string>("created_at");
  const [products, setProducts] = useState([]);
  const [expandedRows, setExpandedRows] = useState<any>(null);

  const fileInputRef = useRef<any>(null);

  const handleClick = () => {
    fileInputRef?.current?.click(); // trigger file picker
  };

  const items = [
    { label: "Ongoing Event", icon: "pi pi-play" },
    { label: "Upcoming Event", icon: "pi pi-home" },
    { label: "Past Event", icon: "pi pi-chart-line" },
    { label: "Invite User", icon: "pi pi-users" },
  ];

  const datepickerFormat = (value: Date) => {
    return {
      day: new Date(value)?.getDate(),
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
      date_event: isModify ? datepickerFormat(event?.date_event) : null,
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
        event_start: formatDatePayload(
          `${formik.values.event_start?.year}-${formik.values.event_start?.month}-${formik.values.event_start?.day}`
        ),
        event_end: formatDatePayload(
          `${formik.values.event_end?.year}-${formik.values.event_end?.month}-${formik.values.event_end?.day}`
        ),
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
        date_event: formatDatePayload(
          `${formik.values.date_event?.year}-${formik.values.date_event?.month}-${formik.values.date_event?.day}`
        ),
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
      setIsModify(false);
      setEvent(null);
      getListEvent();
    },
  });

  const formikAdmin = useFormik<any>({
    initialValues: {
      user_id: "",
      event_id: "",
    },
    validationSchema: Yup.object({
      user_id: Yup.string().required("Required"),
      event_id: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const result: APIResponse<any> = await InventoryService.addAdminEvent({
        event_id: values.event_id,
        user_id: [values.user_id],
      });
      if (result.success) {
        setIsLoading(false);
        setTimeout(() => {
          setAdminDialog(false);
        }, 200);
        getListAdminEvent();
        toast?.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Invite user",
          life: 3000,
        });
        formikAdmin.resetForm();
      }
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
        limit: activeIndex === 3 ? 1000 : size ?? pageSize,
        search: searchValue,
        sort,
        sortBy,
        ...(activeIndex !== 3 && { isUpcoming: activeIndex === 1 }),
        ...(activeIndex !== 3 && { onGoing: activeIndex === 0 }),
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

  const getListAdminEvent = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getAdminEvent({
        page,
        limit: size ?? pageSize,
        search: searchValue,
        sort,
        sortBy,
      });
      setListAdminEvent(response.data);
      setTotalAdmin(response.total_records);
      setTotalPagesAdmin(response.total_pages);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setPageAdmin(1);
      setFirstAdmin(0);
      setListAdminEvent([]);
      setTotalAdmin(0);
      setTotalPagesAdmin(0);
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

  const onDeleteAdminEvent = async (id: string) => {
    try {
      setDeleteConfirmation(false);
      setIsLoading(true);
      await InventoryService.deleteAdminEvent(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete invitation",
        life: 3000,
      });
      getListAdminEvent();
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

  const { data: users } = useGetUsers({
    params: {
      page,
      limit: 1000,
      sort_dir: "ASC",
      sort_by: "fullname",
    },
    options: {
      enabled: true,
    },
  });

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
  }, [page, sort, sortBy, activeIndex]);

  useEffect(() => {
    getListAdminEvent();
  }, [pageAdmin, sortAdmin, sortByAdmin]);

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

  function handleGeneratePdf(base64Data: string[]) {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
    });

    autoTable(doc, {
      html: "#table1",
      showHead: "everyPage",
      columnStyles: {
        0: { minCellHeight: 34, cellWidth: "auto" },
      },
      didDrawCell: (data) => {
        if (
          data.section === "body" &&
          data.column.index === 9 &&
          data.row.index > 0
        ) {
          const base64Img = base64Data[data.row.index - 1];
          if (base64Img) {
            doc.addImage(
              base64Img,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              28,
              28
            );
          }
        }
      },
    });
    doc.setPage(1);
    doc.text("Event", 10, 18);
    doc.save(`event.pdf`);
  }

  const handlePrint = async () => {
    try {
      setIsLoadingPrint(true);
      const items = await convertBase64Event(listEvent);
      setIsLoadingPrint(false);

      setTimeout(() => {
        handleGeneratePdf(
          items
            ?.sort(function (a: any, b: any) {
              if (a.created_at > b.created_at) return 1;
              if (a.created_at < b.created_at) return -1;
              return 0;
            })
            .map((el: any) => el?.base64)
        );
      }, 200);
    } catch (error: any) {
      setIsLoadingPrint(false);
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
        <div>
          {isAdmin && (
            <Button
              label="New"
              icon="pi pi-plus"
              severity="success"
              className="button mr-2"
              onClick={() => {
                setIsModify(false);
                setEvent(null);
                activeIndex === 2
                  ? setAdminDialog(true)
                  : setProductDialog(true);
              }}
            />
          )}
          {activeIndex !== 2 && (
            <Button
              label="Print"
              icon="pi pi-print"
              severity="help"
              disabled={!listEvent?.length}
              className="button mr-2"
              onClick={handlePrint}
            />
          )}
        </div>
      </div>
    );
  };

  const hideDialog = () => {
    setProductDialog(false);
    setIsModify(false);
    setEvent(null);
    setAdminDialog(false);
    formikAdmin.resetForm();
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
        label={isModify ? "Update" : "Save Event"}
        icon="pi pi-check"
        style={{ width: 140 }}
        onClick={() =>
          activeIndex === 2 ? formikAdmin.handleSubmit() : formik.handleSubmit()
        }
        className="button"
      />
    </>
  );

  const header1 = renderHeader1();

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const userData = users?.data?.users?.map((el: any) => {
    return {
      value: el.id,
      label: `${el.fullname} | ${el.user_type}`,
    };
  });

  function formatDate(input: string) {
    const [day, month, year] = input.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  function formatDatePayload(input: string) {
    const [year, month, day] = input.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const fetchLog = async (data: any) => {
    try {
      setEvent(data);
      setIsLoading(true);
      const response = await InventoryService.getEventlog(data.id);
      setEventLog(
        response.data?.map((el: any, idx: number) => {
          return {
            id: idx + 1,
            ...el,
          };
        })
      );
      setIsLoading(false);
      setShowEventlog(true);
    } catch (error: any) {
      setIsLoading(false);
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message,
        life: 3000,
      });
    }
  };

  const expandAll = () => {
    let _expandedRows: any = {};

    eventLog.forEach((p) => (_expandedRows[`${p.id}`] = true));

    setExpandedRows(_expandedRows);
  };

  const collapseAll = () => {
    setExpandedRows(null);
  };

  const allowExpansion = (rowData: any) => {
    return rowData.logs.length > 0;
  };

  const rowExpansionTemplate = (data: any) => {
    return (
      <div className="p-3">
        <h5>Logs at {moment(data.date as any).format("D MMM YYYY")}</h5>
        <DataTable value={data.logs}>
          <Column
            field="customer"
            header="Customer"
            sortable
            body={(data: any) => (
              <p>
                {moment(data.action_time as any).format("D MMM YYYY HH:mm:ss")}
              </p>
            )}
          ></Column>
          <Column field="action" header="Activity" sortable></Column>
          {/* <Column
            field="customer"
            header="Detail"
            sortable
            body={(data: any) => (
              <>
              {data}
              </>

            )}
          ></Column> */}
        </DataTable>
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button icon="pi pi-plus" label="Expand All" onClick={expandAll} text />
      <Button
        icon="pi pi-minus"
        label="Collapse All"
        onClick={collapseAll}
        text
      />
    </div>
  );

  return (
    <>
      {isLoading || isLoadingPrint ? <Loading /> : null}
      <div className="grid">
        <Toast ref={toast} />
        <div className="col-12">
          <div className="card">
            <h5>Event</h5>
            <TabMenu
              model={items}
              activeIndex={activeIndex}
              onTabChange={(e) => setActiveIndex(e.index)}
              pt={{
                menuitem: (a) => {
                  console.log(a)
                }
              }}
            />
            <ConfirmDialog
              visible={deleteConfirmation}
              onHide={() => {
                setDeleteConfirmation(false);
                setEvent(null);
                setIsModify(false);
              }}
              message={
                activeIndex === 2
                  ? `Are you sure you want to delete user event ${event?.event?.name}?`
                  : `Are you sure you want to delete event ${event?.name}?`
              }
              header="Delete Confirmation"
              icon="pi pi-exclamation-triangle"
              accept={() =>
                activeIndex === 2
                  ? onDeleteAdminEvent(event.id)
                  : onDeleteEvent(event.id)
              }
              reject={() => {
                setDeleteConfirmation(false);
                setEvent(null);
              }}
            />
            <div
              style={{
                flex: 1,
                overflowX: "auto",
                width: width * 0.795,
                marginTop: 24,
              }}
            >
              {activeIndex !== 3 ? (
                <DataTable
                  value={listEvent}
                  paginator
                  className="p-datatable-gridlines"
                  onPage={(e) => {
                    setFirst(e.first);
                    setPage(Number(e.page) + 1);
                  }}
                  tableStyle={{  fontSize: 13 }}
                  rows={pageSize}
                  dataKey="id"
                  totalRecords={total}
                  lazy
                  scrollable
                  first={first}
                  alwaysShowPaginator
                  loading={false}
                  responsiveLayout="scroll"
                  emptyMessage="No events found."
                  header={header1}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="{first} to {last} of {totalRecords} events"
                  onSort={(e) => onSort(e.sortField)}
                  sortField={sortBy}
                  sortOrder={sort === "ASC" ? 1 : -1}
                  selectionMode={"single"}
                >
                  {isAdmin && (
                    <Column
                      field="address"
                      header="Action"
                      filterPlaceholder="Search by name"
                      style={{ width: 170, paddingTop: 8, paddingBottom: 8 }}
                      frozen
                      bodyClassName={classNames({ "font-bold": true })}
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
                            className="pi pi-shopping-cart"
                            style={{ fontSize: 16, cursor: "pointer" }}
                          ></div>
                          <div
                            className="pi pi-file-edit"
                            style={{
                              fontSize: 16,
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
                              fontSize: 16,
                              marginLeft: 20,
                              cursor: "pointer",
                            }}
                          ></div>
                          <div
                            className="pi pi-history"
                            onClick={() => {
                              fetchLog(data);
                            }}
                            style={{
                              fontSize: 16,
                              marginLeft: 20,
                              cursor: "pointer",
                            }}
                          ></div>
                        </div>
                      )}
                    />
                  )}
                  <Column
                    field="id"
                    header="ID"
                    filterPlaceholder="Search by name"
                    style={{ minWidth: "2rem" }}
                    sortable
                    sortField="id"
                    frozen
                    bodyClassName={classNames({ "font-bold": true })}
                  />
                  <Column
                    field="name"
                    header="Name"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "6rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="name"
                    frozen
                    bodyClassName={classNames({ "font-bold": true })}
                  />
                  <Column
                    field="description"
                    header="Description"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "6rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                  />
                  <Column
                    field="event_start"
                    header="Start"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "3rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>
                        {moment(data.event_start as any).format("D MMM YYYY")}
                      </p>
                    )}
                    sortable
                    sortField="event_start"
                  />
                  <Column
                    field="event_end"
                    header="Finish"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "3rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>
                        {moment(data.event_end as any).format("D MMM YYYY")}
                      </p>
                    )}
                    sortable
                    sortField="event_end"
                  />
                  <Column
                    field="date_event"
                    header="Date"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "3rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>
                        {data.date_event
                          ? moment(data.date_event as any).format("D MMM YYYY")
                          : "No Data"}
                      </p>
                    )}
                    sortable
                    sortField="date_event"
                  />
                  <Column
                    field="event_code"
                    header="Code"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="event_code"
                  />
                  <Column
                    field="address"
                    header="Location"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="address"
                  />
                  <Column
                    field="event.scan_type"
                    header="Valuation"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>{data.valuation ? currency(data.valuation) : "0"}</p>
                    )}
                    sortable
                    sortField="valuation"
                  />
                  <Column
                    field="scan_type"
                    header="QR Type"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="scan_type"
                  />
                  <Column
                    field="event.scan_type"
                    header="User"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>
                        {users?.data?.users?.length && data.admins?.length
                          ? data.admins
                              ?.map(
                                (el: any) =>
                                  users?.data?.users?.find(
                                    (item: any) => item.id === el
                                  )?.fullname
                              )
                              ?.join(", ")
                          : "-"}
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
                          ? moment(data.updated_at as any).format("LLL")
                          : "-"}
                      </p>
                    )}
                    sortable
                    sortField="updated_at"
                  />
                </DataTable>
              ) : (
                <DataTable
                  value={listAdminEvent}
                  paginator
                  className="p-datatable-gridlines"
                  onPage={(e) => {
                    setFirstAdmin(e.first);
                    setPageAdmin(Number(e.page) + 1);
                  }}
                  tableStyle={{ width: 1800, fontSize: 13 }}
                  rows={pageSizeAdmin}
                  dataKey="id"
                  totalRecords={totalAdmin}
                  lazy
                  scrollable
                  first={firstAdmin}
                  alwaysShowPaginator
                  loading={false}
                  responsiveLayout="scroll"
                  emptyMessage="No invited user found."
                  header={header1}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="{first} to {last} of {totalRecords} invited user"
                  onSort={(e) => onSort(e.sortField)}
                  sortField={sortByAdmin}
                  sortOrder={sortAdmin === "ASC" ? 1 : -1}
                  selectionMode={"single"}
                >
                  {isAdmin && (
                    <Column
                      field="address"
                      header="Action"
                      filterPlaceholder="Search by name"
                      style={{ width: 90, paddingTop: 8, paddingBottom: 8 }}
                      frozen
                      bodyClassName={classNames({ "font-bold": true })}
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
                              router.push(`/event-item?event=${data.event.id}`);
                            }}
                            className="pi pi-shopping-cart"
                            style={{ fontSize: 16, cursor: "pointer" }}
                          ></div>
                          <div
                            className="pi pi-trash"
                            onClick={() => {
                              setEvent(data);
                              setDeleteConfirmation(true);
                            }}
                            style={{
                              fontSize: 16,
                              marginLeft: 20,
                              cursor: "pointer",
                            }}
                          ></div>
                        </div>
                      )}
                    />
                  )}
                  <Column
                    field="id"
                    header="User"
                    filterPlaceholder="Search by name"
                    style={{ minWidth: "2rem" }}
                    frozen
                    body={(data: any) => (
                      <p>
                        {Array.isArray(users?.data?.users)
                          ? users?.data?.users?.find(
                              (el: any) =>
                                Number(el.id) === Number(data.user_id)
                            )?.fullname ?? "-"
                          : "-"}
                      </p>
                    )}
                    bodyClassName={classNames({ "font-bold": true })}
                  />
                  <Column
                    field="event.name"
                    header="Name"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "6rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="name"
                    frozen
                    bodyClassName={classNames({ "font-bold": true })}
                  />
                  <Column
                    field="event.description"
                    header="Description"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "6rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                  />
                  <Column
                    field="event_start"
                    header="Start"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "3rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>
                        {moment(data?.event?.event_start as any).format("LLL")}
                      </p>
                    )}
                    sortable
                    sortField="event_start"
                  />
                  <Column
                    field="event_end"
                    header="Finish"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "3rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>{moment(data?.event?.event_end as any).format("LLL")}</p>
                    )}
                    sortable
                    sortField="event_end"
                  />
                  <Column
                    field="date_event"
                    header="Date"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "3rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    body={(data: any) => (
                      <p>
                        {data.date_event
                          ? moment(data.event.date_event as any).format("LLL")
                          : "No Data"}
                      </p>
                    )}
                    sortable
                    sortField="date_event"
                  />
                  <Column
                    field="event.event_code"
                    header="Code"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="event_code"
                  />
                  <Column
                    field="event.address"
                    header="Location"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="address"
                  />
                  <Column
                    field="event.scan_type"
                    header="QR Type"
                    filterPlaceholder="Search by name"
                    style={{
                      minWidth: "4rem",
                      paddingTop: 8,
                      paddingBottom: 8,
                    }}
                    sortable
                    sortField="scan_type"
                  />
                  <Column
                    field="updated_at"
                    header="Created At"
                    filterPlaceholder="Search by name"
                    style={{ maxWidth: "9rem" }}
                    body={(data: any) => (
                      <p>
                        {data.updated_at
                          ? moment(data.created_at_at as any).format("LLL")
                          : "-"}
                      </p>
                    )}
                    sortable
                    sortField="updated_at"
                  />
                </DataTable>
              )}
            </div>
            <Dialog
              visible={productDialog}
              style={{ width: "800px" }}
              header={
                <div
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#6366f1",
                      width: 50,
                      height: 50,
                      display: "flex",
                      borderRadius: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <i
                      className="pi pi-calendar"
                      style={{ fontSize: "1.3rem", color: "#ffffff" }}
                    ></i>
                  </div>

                  <div
                    style={{
                      flexDirection: "column",
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <Text
                      label={isModify ? "Update Event" : "Add Event"}
                      fontWeight="bold"
                      variant="ultra-large"
                      style={{
                        lineHeight: 1,
                        position: "absolute",
                        bottom: -18,
                      }}
                    />
                    <Text
                      label={"Fill in the details to create a new event"}
                      style={{ position: "absolute", color: "red" }}
                      className="font-medium"
                    />
                  </div>
                </div>
              }
              modal
              className="custom-dialog p-fluid"
              footer={productDialogFooter}
              onHide={hideDialog}
            >
              <div
                className="flex mb-3 gap-2 mt-4"
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#6366f1",
                    borderRadius: 8,
                  }}
                />

                <a
                  className="font-bold"
                  style={{ color: "#808080", fontSize: 14 }}
                >
                  BASIC INFORMATION
                </a>
                <div
                  style={{
                    height: 1,
                    backgroundColor: "#e5e7eb",
                    flex: 1,
                    display: "flex",
                  }}
                />
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <Label title="Name" isRequired />
                  <InputText
                    id="name"
                    value={formik.values.name}
                    onChange={(e) =>
                      formik.setFieldValue("name", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full font-medium py-2 px-3 ${
                      formik.errors.name ? "border-red-600" : "border-gray-300"
                    }`}
                    style={styles.textInput}
                  />
                </div>
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <Label title="Event Code" isRequired />
                  <InputText
                    id="name"
                    value={formik.values.event_code}
                    onChange={(e) =>
                      formik.setFieldValue("event_code", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full font-medium py-2 px-3 ${
                      formik.errors.event_code
                        ? "border-red-600"
                        : "border-gray-300"
                    } `}
                    style={styles.textInput}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <Label title="Description" />
                  <textarea
                    id="name"
                    value={formik.values.description}
                    onChange={(e) =>
                      formik.setFieldValue("description", e.target.value)
                    }
                    autoFocus
                    className={`resize text-black border w-full font-medium py-2 px-3 ${
                      formik.errors.description
                        ? "border-red-600"
                        : "border-gray-300"
                    } `}
                    style={styles.textArea}
                  />
                </div>
              </div>

              <div
                className="flex mb-3 gap-2 mt-4"
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#E3963E",
                    borderRadius: 8,
                  }}
                />

                <a
                  className="font-bold"
                  style={{ color: "#808080", fontSize: 14 }}
                >
                  SCHEDULE
                </a>
                <div
                  style={{
                    height: 1,
                    backgroundColor: "#D3D3D3",
                    flex: 1,
                    display: "flex",
                  }}
                />
              </div>

              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <Label title="Event Start" isRequired />
                  {new Date(event?.event_start) < new Date() ? (
                    <Text
                      fontWeight="regular"
                      color="black"
                      label={moment(
                        formatDate(
                          `${formik.values.event_start?.day}-${formik.values.event_start?.month}-${formik.values.event_start?.year}`
                        )
                      ).format("LL")}
                      textAlign="left"
                      variant="base"
                    />
                  ) : (
                    <InputText
                      id="name"
                      value={moment(
                        formatDate(
                          `${formik.values.event_start?.day}-${formik.values.event_start?.month}-${formik.values.event_start?.year}`
                        )
                      ).format("DD/MM/YYYY")}
                      onFocus={() => {
                        setShowEnd(false);
                        setShowStart(true);
                        setShowDate(false);
                      }}
                      className={`text-black border w-full font-medium py-2 px-3 ${
                        formik.errors.event_start
                          ? "border-red-600"
                          : "border-gray-300"
                      } `}
                      style={styles.textInput}
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
                  <Label title="Event End" isRequired />
                  {new Date(event?.event_start) < new Date() ? (
                    <Text
                      fontWeight="regular"
                      color="black"
                      label={moment(
                        formatDate(
                          `${formik.values.event_end?.day}-${formik.values.event_end?.month}-${formik.values.event_end?.year}`
                        )
                      ).format("LL")}
                      textAlign="left"
                      variant="base"
                    />
                  ) : (
                    <InputText
                      id="name"
                      value={
                        formik.values.event_end
                          ? moment(
                              formatDate(
                                `${formik.values.event_end?.day}-${formik.values.event_end?.month}-${formik.values.event_end?.year}`
                              )
                            ).format("DD/MM/YYYY")
                          : ""
                      }
                      onFocus={() => {
                        setShowEnd(true);
                        setShowStart(false);
                        setShowDate(false);
                      }}
                      className={`text-black border w-full font-medium py-2 px-3 ${
                        formik.errors.event_end
                          ? "border-red-600"
                          : "border-gray-300"
                      } `}
                      style={styles.textInput}
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
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <Label title="Date Event" isRequired />
                  {new Date(event?.event_start) < new Date() ? (
                    <Text
                      fontWeight="regular"
                      color="black"
                      label={
                        formik.values.date_event && formik.values.date_event.day
                          ? moment(
                              formatDate(
                                `${formik.values.date_event?.day}-${formik.values.date_event?.month}-${formik.values.date_event?.year}`
                              )
                            ).format("LL")
                          : "No Data"
                      }
                      textAlign="left"
                      variant="base"
                    />
                  ) : (
                    <InputText
                      id="name"
                      value={
                        formik.values.date_event
                          ? moment(
                              formatDate(
                                `${formik.values.date_event?.day}-${formik.values.date_event?.month}-${formik.values.date_event?.year}`
                              )
                            ).format("DD/MM/YYYY")
                          : ""
                      }
                      onFocus={() => {
                        setShowEnd(false);
                        setShowStart(false);
                        setShowDate(true);
                      }}
                      className={`text-black border w-full font-medium py-2 px-3 ${
                        formik.errors.date_event
                          ? "border-red-600"
                          : "border-gray-300"
                      } `}
                      style={styles.textInput}
                    />
                  )}
                  {showDate && (
                    <div className="absolute">
                      <div className="relative mt-2" style={{ width: 320 }}>
                        <Calendar
                          locale={"en"}
                          value={formik.values.date_event}
                          minimumDate={formik.values.event_start as Day}
                          maximumDate={formik.values.event_end as Day}
                          onChange={(date) => {
                            setShowDate(false);
                            formik.setFieldValue("date_event", date);
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
              <div
                className="flex mb-3 gap-2 mt-4"
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#00A36C",
                    borderRadius: 8,
                  }}
                />

                <a
                  className="font-bold"
                  style={{ color: "#808080", fontSize: 14 }}
                >
                  DETAILS
                </a>
                <div
                  style={{
                    height: 1,
                    backgroundColor: "#e5e7eb",
                    flex: 1,
                    display: "flex",
                  }}
                />
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <Label title="PIC" />
                  <InputText
                    id="name"
                    value={formik.values.PIC as string}
                    onChange={(e) =>
                      formik.setFieldValue("PIC", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full font-medium py-2 px-3 ${
                      formik.errors.PIC ? "border-red-600" : "border-gray-300"
                    } `}
                    style={styles.textInput}
                    placeholder="Person in charge"
                  />
                </div>
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <Label title="Status" />
                  {isModify ? (
                    <Text
                      fontWeight="regular"
                      color="black"
                      label={
                        eventStatus?.data?.data?.find(
                          (el: any) => el.id === formik.values.status
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
                      options={eventStatus?.data?.data?.map?.((el: any) => {
                        return {
                          label: el.name,
                          value: el.id,
                        };
                      })}
                      optionLabel="label"
                      placeholder="Select status"
                      className={`custom-dropdown flex-1 rounded font-medium ${
                        formik.errors.status
                          ? "border-red-600"
                          : "border-gray-300"
                      }`}
                      style={styles.textInput}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <Label title="Address" />
                  <InputText
                    id="name"
                    value={formik.values.address}
                    onChange={(e) =>
                      formik.setFieldValue("address", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full font-medium py-2 px-3 ${
                      formik.errors.address
                        ? "border-red-600"
                        : "border-gray-300"
                    } `}
                    style={styles.textInput}
                    placeholder="Event location / address"
                  />
                </div>
                {/* <div className="field flex-1">
                  <label htmlFor="notes">Note</label>
                  <InputText
                    id="notes"
                    value={formik.values.notes}
                    onChange={(e) =>
                      formik.setFieldValue("notes", e.target.value)
                    }
                    autoFocus
                    className={`text-black border w-full font-medium py-2 px-3 ${
                      formik.errors.notes ? "border-red-600" : "border-gray-300"
                    } `}
                    style={styles.textInput}
                  />
                </div> */}
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <Label title="Qr Type" />
                  <Dropdown
                    onChange={(e) =>
                      formik.setFieldValue("scan_type", e.target.value)
                    }
                    value={formik.values.scan_type}
                    options={SCAN_TYPE}
                    optionLabel="label"
                    placeholder="Select QR Type"
                    className={`custom-dropdown flex-1 rounded font-medium ${
                      formik.errors.scan_type
                        ? "border-red-600"
                        : "border-gray-300"
                    }`}
                    style={styles.textInput}
                  />
                </div>
              </div>
              <div
                className="flex mb-3 gap-2 mt-4"
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#C41E3A",
                    borderRadius: 8,
                  }}
                />

                <a
                  className="font-bold"
                  style={{ color: "#808080", fontSize: 14 }}
                >
                  ADDITIONAL
                </a>
                <div
                  style={{
                    height: 1,
                    backgroundColor: "#e5e7eb",
                    flex: 1,
                    display: "flex",
                  }}
                />
              </div>
              <div className="flex flex-row items-center">
                <div className="field flex-1">
                  <Label title="Note" />
                  <textarea
                    id="name"
                    value={formik.values.notes}
                    onChange={(e) =>
                      formik.setFieldValue("notes", e.target.value)
                    }
                    className={`resize text-black border w-full font-medium py-2 px-3 ${
                      formik.errors.notes ? "border-red-600" : "border-gray-300"
                    } `}
                    style={styles.textArea}
                    placeholder="Any additional notes..."
                  />
                </div>
                <div style={{ width: 16 }} />
                <div className="field flex-1">
                  <Label title="Image" />

                  {base64 ? (
                    <div className="flex flex-row gap-x-4 items-center">
                      <img
                        src={base64}
                        style={{
                          height: 120,
                          width: "100%",
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
                                        STORAGE_BOOQABLE
                                      )
                                    : event.images
                                    ? `https://democreation.site/home/public/${event?.images}`
                                    : event
                                }
                                style={{
                                  width: 120,
                                  height: 120,
                                  borderRadius: 8,
                                }}
                              />
                            )}
                            <input
                              type="file"
                              style={{ color: "#000" }}
                              className="form-control ml-4"
                              onChange={(e) => handleProfile(e)}
                            />
                          </>
                        ) : (
                          <>
                            <div
                              className="border border-1"
                              onClick={handleClick}
                              style={{
                                width: "100%",
                                height: 120,
                                backgroundColor: "#F5F5F5",
                                borderRadius: 10,
                                borderWidth: 10,
                                borderColor: "#d1d5db",
                                borderStyle: "dashed",
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "#c7d2fe",
                                  height: 36,
                                  width: 36,
                                  justifyContent: "center",
                                  alignSelf: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  borderRadius: 4,
                                }}
                              >
                                <Icon
                                  icon="prime:cloud-upload"
                                  className="cursor-pointer"
                                  fontSize={24}
                                  color="#6366f1"
                                  onClick={() => setBase64("")}
                                />
                              </div>
                              <Text
                                label={"Click to upload image"}
                                textAlign="center"
                                fontWeight="semi-bold"
                                style={{ marginBottom: 0 }}
                              />
                              <Text
                                label={"PNG, JPG, GIF up to 10MB"}
                                textAlign="center"
                              />
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handleProfile(e)}
                            />
                          </>
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
            <Dialog
              visible={adminDialog}
              style={{ width: "450px" }}
              header={"Invite User"}
              modal
              className="custom-dialog p-fluid"
              footer={productDialogFooter}
              onHide={() => {
                setAdminDialog(false);
                formikAdmin.resetForm();
              }}
            >
              <div className="field">
                <label htmlFor="name">User</label>
                {users?.data?.users?.length ? (
                  <Dropdown
                    onChange={(e) =>
                      formikAdmin.setFieldValue("user_id", e.target.value)
                    }
                    value={formikAdmin.values.user_id}
                    options={[...userData]}
                    filter
                    optionLabel="label"
                    placeholder="Select user"
                    className={`flex-1 rounded ${
                      formikAdmin.errors.user_id
                        ? "border-red-600"
                        : "border-gray-300"
                    }`}
                  />
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="name">Event</label>
                <Dropdown
                  onChange={(e) =>
                    formikAdmin.setFieldValue("event_id", e.target.value)
                  }
                  value={formikAdmin.values.event_id}
                  options={listEvent?.map((el) => {
                    return {
                      value: el.id,
                      label: el.name,
                    };
                  })}
                  filter
                  optionLabel="label"
                  placeholder="Select event"
                  className={`flex-1 rounded ${
                    formikAdmin.errors.event_id
                      ? "border-red-600"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </Dialog>

            <Dialog
              header={`Log event: ${event?.name}`}
              visible={showEventLog}
              style={{ width: "70%" }}
              onHide={() => {
                if (!showEventLog) return;
                setShowEventlog(false);
                setExpandedRows(null);
              }}
              className="custom-dialog p-fluid"
            >
              <p className="m-0">
                <DataTable
                  value={eventLog}
                  rows={5}
                  expandedRows={expandedRows}
                  // onRowExpand={e =>  setExpandedRows(e.data)}
                  onRowToggle={(e) => setExpandedRows(e.data)}
                  className="p-datatable-gridlines"
                  paginator
                  rowExpansionTemplate={rowExpansionTemplate}
                  dataKey="id"
                  totalRecords={eventLog?.length}
                  emptyMessage="No logs found."
                  tableStyle={{ minWidth: "60rem" }}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="{first} to {last} of {totalRecords} logs"
                >
                  <Column expander={allowExpansion} style={{ width: "5rem" }} />
                  <Column
                    field="created_at"
                    header="Date"
                    filterPlaceholder="Search by name"
                    style={{ minWidth: "3rem" }}
                    body={(data: any) => (
                      <p>{moment(data.date as any).format("D MMM YYYY")}</p>
                    )}
                  />
                  <Column
                    field="created_at"
                    header="Date"
                    filterPlaceholder="Search by name"
                    style={{ minWidth: "3rem" }}
                    body={(data: any) => <p>{data.logs.length} Logs</p>}
                  />
                </DataTable>
              </p>
            </Dialog>

            <table id="table1" style={{ color: "#000", display: "none" }}>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th style={{ width: 200 }}>Description</th>
                <th>Location</th>
                <th>PIC</th>
                <th>User</th>
                <th>Start</th>
                <th>End</th>
                <th>Date</th>
                <th>Image</th>
              </tr>
              {listEvent
                // .sort(function (a: any, b: any) {
                //   if (a.area > b.area) return 1;
                //   if (a.area < b.area) return -1;
                //   return 0;
                // })
                .map((item: any, idx: number) => {
                  return (
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td style={{ textAlign: "left", width: 200 }}>
                        {item.address}
                      </td>
                      <td>{item.PIC}</td>
                      <td>
                        {users?.data?.users?.length && item.admins?.length
                          ? item.admins
                              ?.map(
                                (el: any) =>
                                  users?.data?.users?.find(
                                    (item: any) => item.id === el
                                  )?.fullname
                              )
                              ?.join(", ")
                          : "-"}
                      </td>
                      <td style={{ textAlign: "left", width: 70 }}>
                        {moment(item.event_start as any).format("D MMM YYYY")}
                      </td>
                      <td style={{ textAlign: "left", width: 150 }}>
                        {moment(item.event_end as any).format("D MMM YYYY")}
                      </td>
                      <td style={{ textAlign: "left", width: 150 }}>
                        {item.date_event
                          ? moment(item.date_event as any).format("D MMM YYYY")
                          : "No Data"}
                      </td>
                      <td>
                        <img src={item.base64} />
                      </td>
                    </tr>
                  );
                })}
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableDemo;
