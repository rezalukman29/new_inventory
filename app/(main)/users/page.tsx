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
import { Text } from "@/app/components/atoms/Text";
import { Icon } from "@iconify/react";
import "./index.css";

import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import Loading from "@/app/components/atoms/loading";
import { localStorageService } from "@/app/service/localStorage";
import { SCAN_TYPE } from "@/app/util/data";
import { getUsers } from "@/app/hooks/api/useGetUsers";
import useAccountController from "../useAccountController";

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
  const [selected, setSelecetd] = useState<any | null>(null);
  console.log(isAdmin);
  const datepickerFormat = (value: Date) => {
    return {
      day: moment(value)?.day() + 1,
      month: moment(value)?.month() + 1,
      year: moment(value)?.year(),
    };
  };

  const checkAuth = () => {
    const auth = localStorageService.getAuth("auth");
    if (auth) {
      return;
    } else {
      router.push("/auth/login");
    }
  };

  const formik = useFormik<any>({
    initialValues: {
      fullname: isModify ? selected.fullname : "",
      password: isModify ? selected.password : "",
      email: isModify ? selected.email : "",
      user_type: isModify ? selected.user_type : "",
    },
    validationSchema: Yup.object({
      fullname: Yup.string().required("Required"),
      password: Yup.string().required("Required"),
      email: Yup.string().email('Invalid email address').required("Required"),
      user_type: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      if (isModify) {
        const result: APIResponse<any> = await InventoryService.editEvent({
          ...values,
          id: selected.id,
        });
        if (result.success) {
          setTimeout(() => {
            setProductDialog(false);
          }, 200);
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Modify User",
            life: 3000,
          });
        }
      } else {
        try {
          const result: APIResponse<any> = await InventoryService.addUser({
            ...values,
          });
          if (result.success) {
            setTimeout(() => {
              setProductDialog(false);
            }, 200);
          }
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Adding User",
            life: 3000,
          });
        } catch(error: any) {
          toast?.current?.show({
            severity: "error",
            summary: error?.response?.data?.message,
            detail: "",
            life: 3000,
          });
          console.log(error?.response?.data?.message)
          setIsLoading(false);
        }

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
      const response = await getUsers({
        params: {
          page,
          limit: size ?? pageSize,
          search: searchValue,
          sort_dir: sort.toLowerCase(),
          sort_by: sortBy,
          ...(!isAdmin && { user_type: "EMPLOYEE" }),
        },
      });
      console.log(response);
      setListEvent(response.data.users);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
      setIsLoading(false);
    } catch (error: any) {
      if (error?.response?.data?.message === 'expired token, please relogin') {
        localStorageService.clearAuth("auth");
        checkAuth();
        toast?.current?.show({
          severity: "error",
          summary: "Please login again",
          detail: "",
          life: 3000,
        });
      }
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
      await InventoryService.deleteUser({ id });
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete User",
        life: 3000,
      });
      getListEvent();
      setIsLoading(false);
    } catch (error: any) {
      toast?.current?.show({
        severity: "error",
        summary: error?.response?.data?.message,
        detail: "",
        life: 3000,
      });
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
            <h5>Users</h5>
            <ConfirmDialog
              visible={deleteConfirmation}
              onHide={() => {
                setDeleteConfirmation(false);
                setEvent(null);
                setIsModify(false);
              }}
              message={`Are you sure you want to delete user ${selected?.fullname}?`}
              header="Delete Confirmation"
              icon="pi pi-exclamation-triangle"
              accept={() => onDeleteEvent(selected.id)}
              reject={() => {
                setDeleteConfirmation(false);
                setSelecetd(null);
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
                rows={pageSize}
                dataKey="id"
                totalRecords={total}
                lazy
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
                  style={{ minWidth: "4rem" }}
                  sortable
                  sortField="id"
                />
                <Column
                  field="fullname"
                  header="Name"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "6rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="fullname"
                />
                <Column
                  field="email"
                  header="Email"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "6rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="email"
                />
                <Column
                  field="created_at"
                  header="Created At"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="created_at"
                  body={(data: any) => (
                    <p>{moment(data.created_at as any).format("D MMM YYYY, HH:MM")}</p>
                  )}
                />
                <Column
                  field="user_type"
                  header="Role"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                  sortable
                  sortField="user_type"
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
                          className="pi pi-file-edit"
                          style={{
                            fontSize: 18,
                            marginLeft: 20,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setIsModify(true);
                            setSelecetd(data);
                            setProductDialog(true);
                          }}
                        ></div>

                        <div
                          className="pi pi-trash"
                          onClick={() => {
                            setSelecetd(data);
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
              style={{ width: "450px" }}
              header={isModify ? "Modify User" : "Add User"}
              modal
              className="p-fluid"
              footer={productDialogFooter}
              onHide={hideDialog}
            >
              <div className="field">
                <label htmlFor="name">Name</label>
                <InputText
                  id="name"
                  value={formik.values.fullname}
                  onChange={(e) => formik.setFieldValue("fullname", e.target.value)}
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.fullname
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div className="field">
                <label htmlFor="name">Email</label>
                <InputText
                  id="name"
                  value={formik.values.description}
                  onChange={(e) =>
                    formik.setFieldValue("email", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.email ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div className="field">
                <label htmlFor="name">Password</label>
                <InputText
                  id="name"
                  value={formik.values.password}
                  onChange={(e) =>
                    formik.setFieldValue("password", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.password
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div className="field flex-1">
                <label htmlFor="name">Role</label>
                <Dropdown
                  value={formik.values.user_type}
                  onChange={(e) => {
                    formik.setFieldValue("user_type", e.value);
                  }}
                  options={[
                    { value: "ADMIN", label: "Admin" },
                    { value: "EMPLOYEE", label: "Employee" },
                  ]}
                  optionLabel="label"
                  placeholder="Select Option"
                  className="w-full md:w-14rem mr-4"
                  style={{
                    ...(formik.errors.user_type && { borderColor: "red" }),
                  }}
                />
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableDemo;
