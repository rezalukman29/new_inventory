"use client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";
import { InventoryService } from "@/app/service/InventoryService";
import { isValidUrl, noImage } from "@/app/util/function";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { Text } from "@/app/components/atoms/Text";

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
  const [gudang, setGudang] = React.useState<any>([]);
  const [searchValue, setSearchValue] = useState("");
  const [listInventory, setListInventory] = useState<any[]>([]);
  const [selectedGudang, setSelectedGudang] = React.useState<any>({
    value: "All",
    label: "All warehouse",
  });
  const [listBarang, setListBarang] = useState<any[]>([]);
  const [listCategory, setListCategory] = useState<ISelect[]>([]);
  const [searchInventory, setSearchInventory] = useState("");
  const [productDialog, setProductDialog] = useState(false);
  const [barang, setBarang] = useState<any | null>(null);
  const [inventory, setInventory] = useState<any | null>(null);

  const formik = useFormik<any>({
    initialValues: {
      stok: isModify ? barang.stok_barang.toString() : "",
      gudang_id: isModify ? barang.gudang_id.toString() : "",
      kode: isModify ? barang.kode_gudang : "",
      keyname: isModify ? barang.keyname : "",
      asile: isModify ? barang.asile : "",
      rack: isModify ? barang.asile : "",
      level: isModify ? barang.level : "",
      stok_minimum: isModify ? barang.stok_minimum.toString() : "",
      lantai: isModify ? barang.lantai : "",
      lorong: isModify ? barang.lorong : "",
      flag_1: isModify ? barang.flag_1 : "",
      flag_2: isModify ? barang.flag_2 : "",
    },
    validationSchema: Yup.object({
      stok: Yup.string().required("Required"),
      gudang_id: Yup.string().required("Required"),
      stok_minimum: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!inventory)
        return toast?.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Please select item",
          life: 3000,
        });
      setProductDialog(false);
      setIsLoading(true);
      const payload = {
        ...values,
        barang_id: inventory?.id,
        gudang_id: Number(values.gudang_id),
        stok: Number(values.stok),
        stok_minimum: Number(values.stok_minimum),
        code: values.kode,
      };
      setProductDialog(false);
      if (isModify) {
        try {
          delete payload.kode;
          const result: APIResponse<any> = await InventoryService.editBarang({
            ...payload,
            id: barang.barang_gudang_id,
          });
          if (result.success) {
            toast?.current?.show({
              severity: "success",
              summary: "Success",
              detail: "Modify warehouse item",
              life: 3000,
            });
            setIsModify(false);
            formik.resetForm();
            setBarang(null);
            setIsLoading(false);
            getInventoryList();
          }
        } catch (error: any) {
          setIsLoading(false);
          if (
            error.response.data.message ===
            "Error 1062: Duplicate entry '123' for key 'barang.code'"
          ) {
            formik.setFieldError("code", error.response.data.message);
          }
          toast?.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.response.data.message,
            life: 3000,
          });
        }
      } else {
        try {
          const result: APIResponse<any> =
            await InventoryService.addBarangGudang(payload);
          if (result.success) {
            toast?.current?.show({
              severity: "success",
              summary: "Success",
              detail: "Adding warehouse item",
              life: 3000,
            });
            setIsModify(false);
            formik.resetForm();
            setBarang(null);
            setIsLoading(false);
            setInventory(null);
            getInventoryList();
            setSearchInventory("");
          }
        } catch (error: any) {
          setIsLoading(false);
          if (
            error.response.data.message ===
            "Error 1062: Duplicate entry '123' for key 'barang.code'"
          ) {
            formik.setFieldError("code", error.response.data.message);
          }

          toast?.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.response.data.message,
            life: 3000,
          });
        }
      }
    },
  });

  const getInventoryList = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getBarangGudang(
        selectedGudang.value,
        page,
        searchValue,
        size ?? pageSize
      );
      setListBarang(response.data);
      setTotal(response.total_records);
      setTotalPages(response.total_pages);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getItemCategory = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getItemCategory();
      setListCategory(
        response.data.map((item: any) => {
          return {
            label: item.name,
            value: item.id.toString(),
          };
        })
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getBarang = async (size?: number) => {
    try {
      const response = await InventoryService.getInventory({
        order: "asc",
        page: 1,
        limit: 50,
        search: searchInventory,
      });
      setListInventory(response.data.data);
    } catch (error) {}
  };

  const onDeleteItem = async (id: string) => {
    try {
      setIsLoading(true);
      await InventoryService.deleteBarangGudang(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete warehouse inventory",
        life: 3000,
      });
      getInventoryList();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const getGudang = async () => {
    try {
      setIsLoading(true);
      const response: any = await InventoryService.getGudang();
      setGudang(
        response.data.map((item: any) => {
          return {
            label: item.nama,
            value: item.id.toString(),
          };
        })
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInventoryList();
  }, [page]);

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
          <Dropdown
            value={selectedGudang?.value}
            onChange={(e) => setSelectedGudang(e)}
            options={[...[{ value: "All", label: "All warehouse" }], ...gudang]}
            optionLabel="label"
            placeholder="Select warehouse"
            className="w-full md:w-14rem mr-4"
          />
          <Button
            label="Submit"
            onClick={() => {
              if (page === 1) {
                getInventoryList();
              } else {
                setPage(1);
              }
            }}
          />
        </div>
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

  const inventoryImage = (item: any) => {
    return (
      <img
        src={
          isValidUrl(item.photo)
            ? item.photo
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

  useEffect(() => {
    getGudang();
    getBarang();
    getItemCategory();
  }, []);

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
        type="submit"
        onClick={() => formik.handleSubmit()}
      />
    </>
  );

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Warehouse Inventory</h5>
          <DataTable
            value={listBarang}
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
            currentPageReportTemplate="{first} to {last} of {totalRecords} warehouse inventory"
          >
            <Column
              field="nama_barang"
              header="Name"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="stok_gudang"
              header="Warehouse Stock"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              headerStyle={{ justifyItems: "center" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stok_barang"
              header="Item Stock"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stok_minimum"
              header="Stok Min"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stock_used"
              header="Stok Used"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="flag_1"
              header="Flag 1"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="flag_2"
              header="Flag 2"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stok_minimum"
              header="Image"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              body={inventoryImage}
              bodyStyle={{ padding: 4, textAlign: "center" }}
            />
            <Column
              field="address"
              header="Action"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
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
                      setBarang(data);
                      setProductDialog(true);
                      setInventory({ id: data.barang_id });
                    }}
                    className="pi pi-file-edit"
                    style={{ fontSize: 18, cursor: "pointer" }}
                  ></div>

                  <div
                    className="pi pi-trash"
                    onClick={() => onDeleteItem(data.barang_gudang_id)}
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
            style={{ width: "500px" }}
            header={isModify ? "Modify Warehouse Item" : "Add Warehouse Item"}
            modal
            className="p-fluid"
            footer={productDialogFooter}
            onHide={hideDialog}
          >
            <div className="field">
              <label htmlFor="name">keywords</label>
              <div className="flex flex-row items-center">
                <InputText
                  id="name"
                  value={searchInventory}
                  onChange={(e: any) => setSearchInventory(e.target.value)}
                  autoFocus
                />
                <div style={{ width: 16 }} />
                <Button
                  label="Search"
                  icon="pi pi-search"
                  className="mr-2"
                  style={{ width: 120 }}
                  onClick={() => {
                    getBarang();
                  }}
                />
              </div>
            </div>
            <div
              className="overflow-y-auto grid grid-cols-1 lg:grid-cols-2 lg:gap-3 gap-3 mt-3"
              style={{ maxHeight: 300 }}
            >
              {listInventory?.map((item, idx) => {
                const isSelected = inventory?.id === item.id;
                return (
                  <div
                    onClick={() => {
                      setInventory(item);
                      formik.setFieldValue("stok", "");
                    }}
                    style={{
                      backgroundColor: isSelected ? "#6366F1" : "#fff",
                      width: "100%",
                    }}
                    key={`${item.id}_idx`}
                    className={`cursor-pointer ml-2 px-3 py-2 rounded flex flex-row items-center ${
                      isSelected ? "bg-[#6366F1]" : "bg-white"
                    }`}
                  >
                    <img
                      src={
                        isValidUrl(item.photo)
                          ? item.photo
                          : item.photo
                          ? `https://democreation.site/home/public/${item.photo}`
                          : noImage
                      }
                      style={{ width: 86, height: 86, borderRadius: 8 }}
                    />
                    <div className="flex-col ml-3">
                      <Text
                        fontWeight="semi-bold"
                        label={item.nama ? item.nama : "No name"}
                        color={isSelected ? "white" : "black"}
                      />
                      <Text
                        fontWeight="regular"
                        label={`Stok: ${item.stok_barang}`}
                        color={isSelected ? "white" : "black"}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 16 }} />
            <div className="flex flex-row items-center">
              <div className="field flex-1">
                <label htmlFor="name">Stok</label>
                <InputText
                  id="name"
                  value={formik.values.stok}
                  onChange={(e) => {
                    if (
                      (Number(e.target.value) > 0 &&
                        Number(e.target.value) <= inventory?.stok_barang &&
                        !e.target.value.includes(".")) ||
                      (e.target.value === "" && !e.target.value.includes("."))
                    ) {
                      formik.setFieldValue("stok", e.target.value);
                      formik.setFieldError("stok", undefined);
                    }
                  }}
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.stok ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field flex-1">
                <label htmlFor="name">Stok minimum</label>
                <InputText
                  id="name"
                  value={formik.values.stok_minimum}
                  onChange={(e) =>
                    formik.setFieldValue("stok_minimum", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.stok_minimum
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="field">
                <label htmlFor="name">Kode</label>
                <InputText
                  id="name"
                  value={formik.values.kode}
                  onChange={(e) => formik.setFieldValue("kode", e.target.value)}
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.kode ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field">
                <label htmlFor="name">Rack</label>
                <InputText
                  id="name"
                  value={formik.values.rack}
                  onChange={(e) => formik.setFieldValue("rack", e.target.value)}
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.rack ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="field">
                <label htmlFor="name">Lantai</label>
                <InputText
                  id="name"
                  value={formik.values.lantai}
                  onChange={(e) =>
                    formik.setFieldValue("lantai", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.lantai ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field">
                <label htmlFor="name">Lorong</label>
                <InputText
                  id="name"
                  value={formik.values.lorong}
                  onChange={(e) =>
                    formik.setFieldValue("lorong", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.lorong ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="field">
                <label htmlFor="name">Flag 1</label>
                <InputText
                  id="name"
                  value={formik.values.flag_1}
                  onChange={(e) =>
                    formik.setFieldValue("flag_1", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.flag_1 ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field">
                <label htmlFor="name">Flag 2</label>
                <InputText
                  id="name"
                  value={formik.values.flag_2}
                  onChange={(e) =>
                    formik.setFieldValue("flag_2", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.flag_2 ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
            </div>
            <Dropdown
              onChange={(e) =>
                formik.setFieldValue("gudang_id", e.target.value)
              }
              value={formik.values.gudang_id}
              options={[
                ...[{ value: "", label: "Select warehouse" }],
                ...gudang,
              ]}
              optionLabel="label"
              placeholder="Select warehouse"
              className="mr-4 flex-1"
              // style={{ width: "100%" }}
            />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
