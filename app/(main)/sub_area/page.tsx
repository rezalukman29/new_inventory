"use client";
import { CustomerService } from "../../../demo/service/CustomerService";
import { ProductService } from "../../../demo/service/ProductService";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Demo } from "@/types";
import { InventoryService } from "@/app/service/InventoryService";
import { isValidUrl, noImage } from "@/app/util/function";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import useGetEventStatus from "@/app/hooks/api/useGetEventStatus";
import moment from "moment";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { Dialog } from "primereact/dialog";
import { useSearchParams } from "next/navigation";
import { SortType } from "@/app/interfaces/interfaces";
import "../index.css";

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
  const [gudang, setGudang] = useState<any | null>(null);
  const [gudangs, setGudangs] = React.useState<any>([]);
  const [listArea, setListArea] = useState<any[]>([]);
  const [listSubArea, setListSubArea] = useState<any[]>([]);
  const [selected, setSelecetd] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [productDialog, setProductDialog] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const searchParams = useSearchParams();
  const areaId: any = searchParams.get("id");
  const [sort, setSort] = useState<SortType>("ASC");
  const [sortBy, setSortBy] = useState<string>("sub_area_name");

  const formik = useFormik<any>({
    initialValues: {
      area_id: isModify ? selected.area_id?.toString() : "",
      sub_area_name: isModify ? selected.sub_area_name : "",
    },
    validationSchema: Yup.object({
      sub_area_name: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const payload: any = {
        area_id: Number(values.area_id),
        sub_area_name: values.sub_area_name,
      };
      if (isModify) {
        const result: APIResponse<any> = await InventoryService.editSubArea({
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
            detail: "Modify Sub Area",
            life: 3000,
          });
        }
      } else {
        const result: APIResponse<any> = await InventoryService.addSubArea(
          payload
        );
        if (result.success) {
          setTimeout(() => {
            setProductDialog(false);
          }, 200);
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Adding Sub Area",
            life: 3000,
          });
        }
      }
      setIsModify(false);
      setIsLoading(false);
      getListSubArea();
      formik.resetForm();
      getListArea();
    },
  });

  const onChangeStatus = (e: any) => {
    setSelectedStatus(e.target.value);
  };
  const getListArea = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getArea({
        sort: "ASC",
        sortBy: "name",
      });
      setListArea(response.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const getListSubArea = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getSubArea({ sort, sortBy });
      if (areaId) {
        setListSubArea(
          response.data?.filter((el) => Number(el.area_id) === Number(areaId))
        );
      } else {
        setListSubArea(response.data);
      }
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const onDeleteEvent = async (id: string) => {
    try {
      setDeleteConfirmation(false);
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
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          className="button mr-2"
          onClick={() => setProductDialog(true)}
        />
      </div>
    );
  };

  const header1 = renderHeader1();

  useEffect(() => {
    getListArea();
  }, []);

  useEffect(() => {
    getListSubArea();
  }, [sort, sortBy]);

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

  const areaOption = useMemo(() => {
    return listArea?.map((el) => {
      return {
        value: el.id.toString(),
        label: el.name,
      };
    });
  }, [listArea]);

  let [over, setOver] = React.useState("");

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Sub Area</h5>
          <ConfirmDialog
            visible={deleteConfirmation}
            onHide={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
            message={`Are you sure you want to delete sub area ${selected?.sub_area_name}?`}
            header="Delete Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => onDeleteEvent(selected.id)}
            reject={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
          />
          <DataTable
            value={listSubArea.filter(
              (el) =>
                el.sub_area_name &&
                el.sub_area_name.match(new RegExp(searchValue, "i"))
            )}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={listSubArea.length}
            dataKey="id"
            totalRecords={listSubArea.length}
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
              field="sub_area_name"
              header="Sub Area"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              sortable
              sortField="sub_area_name"
            />
            <Column
              field="lokasi"
              header="Area"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data) => {
                const area =
                  listArea?.find((el) => el.id === data.area_id)?.name ?? "";
                return <p>{area}</p>;
              }}
              sortable
              sortField="area_name"
            />
            <Column
              field="created_at"
              header="Created At"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p>{moment(data.created_at as any).format("LLL")}</p>
              )}
              sortable
              sortField="created_at"
            />
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
                    onClick={() => {
                      setIsModify(true);
                      setSelecetd(data);
                      setProductDialog(true);
                    }}
                    onMouseOver={() => setOver(data.id + "edit")}
                    onMouseOut={() => setOver("")}
                    style={{
                      fontSize: 18,
                      cursor: "pointer",
                      color: over === data.id + "edit" ? "blue" : undefined,
                    }}
                  ></div>

                  <div
                    className="pi pi-trash"
                    onClick={() => {
                      setSelecetd(data);
                      setDeleteConfirmation(true);
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
            header={isModify ? "Modify Sub Area" : "Add Sub Area"}
            modal
            className="p-fluid"
            footer={productDialogFooter}
            onHide={hideDialog}
          >
            <div className="field">
              <label htmlFor="name">Area</label>
              <Dropdown
                onChange={(e) =>
                  formik.setFieldValue("area_id", e.target.value)
                }
                value={formik.values.area_id}
                options={[
                  ...[{ value: "", label: "Select area" }],
                  ...areaOption,
                ]}
                optionLabel="label"
                placeholder="Select warehouse"
                className="mr-4 flex-1"
                // style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Sub Area Name</label>
              <InputText
                id="name"
                value={formik.values.sub_area_name}
                onChange={(e) =>
                  formik.setFieldValue("sub_area_name", e.target.value)
                }
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.sub_area_name
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
