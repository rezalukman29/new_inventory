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
  const [productDialog, setProductDialog] = useState(false);
  const [selected, setSelecetd] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

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
      setGudangs(response.data);
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

  const header1 = renderHeader1();

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

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Warehouse</h5>
          <ConfirmDialog
            visible={deleteConfirmation}
            onHide={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
            message={`Are you sure you want to delete warehouse ${selected?.nama}?`}
            header="Delete Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => onDeleteEvent(selected.id)}
            reject={() => {
              setDeleteConfirmation(false);
              setSelecetd(null);
            }}
          />
          <DataTable
            value={gudangs}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={pageSize}
            dataKey="id"
            totalRecords={gudangs.length}
            lazy
            first={first}
            alwaysShowPaginator
            loading={isLoading}
            responsiveLayout="scroll"
            emptyMessage="No customers found."
            header={header1}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="{first} to {last} of {totalRecords} warehouse"
          >
            <Column
              field="nama"
              header="Name"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="lokasi"
              header="Location"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="pic"
              header="PIC"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="created_at"
              header="Created At"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem" }}
              body={(data: any) => (
                <p>{moment(data.created_at as any).format("LLL")}</p>
              )}
            />
            <Column
              field="address"
              header="Action"
              headerStyle={{ justifyItems: "center" }}
              bodyStyle={{ textAlign: "center" }}
              filterPlaceholder="Search by name"
              style={{ width: 100 }}
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
                      setGudang(data);
                      setProductDialog(true);
                    }}
                    style={{ fontSize: 18, cursor: "pointer" }}
                  ></div>

                  <div
                    className="pi pi-trash"
                    onClick={() => {
                      setSelecetd(data);
                      setDeleteConfirmation(true);
                    }}
                    style={{ fontSize: 18, marginLeft: 20, cursor: "pointer" }}
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
                autoFocus
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
                autoFocus
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
