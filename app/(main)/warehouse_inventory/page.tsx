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
import { getLogActivity } from "@/app/hooks/api/useGetLogActivity";
import useGetEmiUser from "@/app/hooks/api/useGetEmiUser";
import { OverlayPanel } from "primereact/overlaypanel";
import moment from "moment";
import "../index.css";
import useAccountController from "../useAccountController";
import { classNames } from "primereact/utils";

interface ISelect {
  label: string;
  value: string;
}

const TableDemo = () => {
  const opMenu = useRef<any>(null);
  const { isAdmin } = useAccountController();
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
  const [logs, setLogs] = useState<any[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [pageLog, setPageLog] = useState<number>(1);
  const [totalLog, setTotalLog] = useState<number>(10);
  const [firstLog, setFirstLog] = useState<number>(0);

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
          const result: APIResponse<any> =
            await InventoryService.editBarangGudang({
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
      setPage(1);
      setFirst(0);
      setListBarang([]);
      setTotal(0);
      setTotalPages(0);
    }
  };

  const getItemCategory = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getItemCategory({
        sort: "ASC",
        sort_by: "name",
      });
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

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      if (page === 1) {
        getInventoryList();
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
          <Dropdown
            value={selectedGudang?.value}
            onChange={(e) => setSelectedGudang(e)}
            options={[...[{ value: "All", label: "All warehouse" }], ...gudang]}
            optionLabel="label"
            placeholder="Select warehouse"
            className="w-full md:w-14rem mr-4"
          />
          <Button
            label="Search"
            onClick={() => {
              if (page === 1) {
                getInventoryList();
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

  const header1 = renderHeader1();

  const inventoryImage = (item: any) => {
    return (
      <img
        src={
          isValidUrl(item.photo) &&
          item.photo.includes("http://66.42.48.163:9000")
            ? item?.photo?.replace(
                "http://66.42.48.163:9000/booqable/",
                "https://storage-booqable.emi-project.my.id/booqable/"
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
        type="submit"
        onClick={() => formik.handleSubmit()}
        className="button"
      />
    </>
  );

  const getLogs = async () => {
    try {
      opMenu.current.hide();
      const response = await getLogActivity({
        page: pageLog,
        limit: 10,
        module: "v1/barang-gudang",
        barang_id: barang.barang_id,
        gudang_id: barang.gudang_id,
      });
      setLogs(response.data.data);
      setTotalLog(response.data.total_records);
      setShowLog(true);
    } catch (error) {}
  };

  const { data: users } = useGetEmiUser({
    options: {
      enabled: true,
    },
  });

  const getModule = (path: string) => {
    const module = categorize(path);
    switch (module) {
      case "/v1/fix-event-list":
        return "event item";
      case "/v1/event":
        return "event";
      case "/v1/barang":
        return "inventory item";
      case "/v1/gudang":
        return "gudang";
      case "/v1/barang-gudang":
        return "warehouse item";
      case "/v1/area":
        return "area";
      case "/v1/sub-area":
        return "sub area";
      default:
        return "";
    }
  };

  function categorize(url: string) {
    if (url.includes("fix-event-list")) {
      return "/v1/fix-event-list";
    }
    if (url.includes("event")) {
      return "/v1/event";
    }
    if (url.includes("barang-gudang")) {
      return "/v1/barang-gudang";
    }
    if (url.includes("gudang")) {
      return "/v1/gudang";
    }
    if (url.includes("barang")) {
      return "/v1/barang";
    }
    if (url.includes("sub-area")) {
      return "/v1/sub-area";
    }
    if (url.includes("sub-area")) {
      return "/v1/sub-area";
    }
    if (url.includes("area")) {
      return "/v1/area";
    }
    return url;
  }

  function isJSON(str: string) {
    try {
      return JSON.parse(str) && !!str;
    } catch (e) {
      return false;
    }
  }

  const getName = (path: string, payload: string) => {
    const module = categorize(path);
    const isJson = isJSON(payload);
    switch (module) {
      case "/v1/login":
        return isJson ? `"Email: ${JSON.parse(payload)?.email}"` : "";
      case "/v1/fix-event-list":
        return isJson
          ? `"Area id: ${JSON.parse(payload)?.list_id}, Event id: ${
              JSON.parse(payload)?.event_id
            }, Sub area id: ${JSON.parse(payload)?.sub_list_id}"`
          : "";
      case "/v1/event":
        return isJson
          ? `"${JSON.parse(payload)?.name}"`
          : path?.split("/")?.length === 4
          ? `"Event id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/barang":
        return isJson
          ? `"${
              JSON.parse(payload)?.nama ??
              JSON.parse(payload)?.name ??
              `Barang Id: ${JSON.parse(payload)?.id}`
            }"`
          : path?.split("/")?.length === 4
          ? `"Barang id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/barang-gudang":
        return isJson
          ? `"Barang id: ${JSON.parse(payload)?.barang_id}, Stok: ${
              JSON.parse(payload)?.stok
            }, Warehouse id: ${JSON.parse(payload)?.gudang_id}"`
          : "";
      case "/v1/area":
        return isJson
          ? `"${JSON.parse(payload)?.nama ?? JSON.parse(payload)?.name}"`
          : path?.split("/")?.length === 4
          ? `"Area id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/sub-area":
        return isJson
          ? `"${JSON.parse(payload)?.sub_area_name}"`
          : path?.split("/")?.length === 4
          ? `"Sub area id: ${path?.split("/")[3]}"`
          : "";
      case "/v1/gudang":
        return isJson
          ? `"${JSON.parse(payload)?.nama ?? JSON.parse(payload)?.name}"`
          : path?.split("/")?.length === 4
          ? `"Sub area id: ${path?.split("/")[3]}"`
          : "";
      default:
        return "";
    }
  };

  useEffect(() => {
    getLogs();
  }, [pageLog]);

  let [over, setOver] = React.useState("");

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
            tableStyle={{ width: 1800, fontSize: 13 }}
            first={first}
            alwaysShowPaginator
            loading={isLoading}
            scrollable
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
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyClassName={classNames({ 'font-bold': true })}
              frozen
            />
            <Column
              field="stok_gudang"
              header="Warehouse Stock"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              headerStyle={{ justifyItems: "center" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="gudang_name"
              header="Warehouse Name"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              headerStyle={{ justifyItems: "center" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stok_barang"
              header="Item Stock"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stok_minimum"
              header="Stok Min"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stock_used"
              header="Stok Used"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stock_used"
              header="Minimum Status"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
              body={(data) => {
                const isLow = data.stok_gudang < data.stok_minimum;
                const isNotSet = data.stok_minimum === 0 || !data.stok_minimum;
                const isSafe = data.stok_gudang >= data.stok_minimum;
                return (
                  <Button
                    label={isLow ? "Low" : isNotSet ? "Not Set" : "Safe"}
                    outlined
                    severity={
                      isLow ? "danger" : isNotSet ? "secondary" : "success"
                    }
                    className="button"
                  />
                );
              }}
            />
            <Column
              field="flag_1"
              header="Flag 1"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="flag_2"
              header="Flag 2"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="asile"
              header="Asile"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="rack"
              header="Rack"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="level"
              header="Level"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="lantai"
              header="Lantai"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="lorong"
              header="Lorong"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="stok_minimum"
              header="Image"
              headerStyle={{ justifyItems: "center" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
              body={inventoryImage}
              bodyStyle={{ padding: 4, textAlign: "center" }}
            />
            {isAdmin && (
              <Column
                field="address"
                header="Action"
                headerStyle={{ justifyItems: "center" }}
                style={{ width: 120, paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                body={(data) => {
                  return (
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
                        onMouseOver={() =>
                          setOver(data.barang_gudang_id + "edit")
                        }
                        onMouseOut={() => setOver("")}
                        className="pi pi-file-edit"
                        style={{
                          fontSize: 18,
                          cursor: "pointer",
                          color:
                            over === data.barang_gudang_id + "edit"
                              ? "blue"
                              : undefined,
                        }}
                      ></div>

                      <div
                        className="pi pi-trash"
                        onClick={() => onDeleteItem(data.barang_gudang_id)}
                        onMouseOver={() =>
                          setOver(data.barang_gudang_id + "delete")
                        }
                        onMouseOut={() => setOver("")}
                        style={{
                          fontSize: 18,
                          marginLeft: 8,
                          cursor: "pointer",
                          color:
                            over === data.barang_gudang_id + "delete"
                              ? "blue"
                              : undefined,
                        }}
                      ></div>
                      <OverlayPanel ref={opMenu}>
                        <div
                          style={{
                            paddingLeft: 12,
                            paddingRight: 12,
                            cursor: "pointer",
                          }}
                          onClick={getLogs}
                        >
                          <p className="text-lg">Log</p>
                        </div>
                      </OverlayPanel>
                      <div
                        className="pi pi-ellipsis-v"
                        onClick={(e) => {
                          opMenu.current.toggle(e);
                          setBarang(data);
                          setFirstLog(0);
                          setPageLog(1);
                        }}
                        onMouseOver={() =>
                          setOver(data.barang_gudang_id + "more")
                        }
                        onMouseOut={() => setOver("")}
                        style={{
                          fontSize: 18,
                          marginLeft: 12,
                          cursor: "pointer",
                          color:
                            over === data.barang_gudang_id + "more"
                              ? "blue"
                              : undefined,
                        }}
                      ></div>
                    </div>
                  );
                }}
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
                  className="button mr-2"
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
                        isValidUrl(item.photo) &&
                        item.photo.includes("http://66.42.48.163:9000")
                          ? item?.photo?.replace(
                              "http://66.42.48.163:9000/booqable/",
                              "https://storage-booqable.emi-project.my.id/booqable/"
                            )
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
                        // Number(e.target.value) <= inventory?.stok_barang &&
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
          <Dialog
            header={`Log: ${barang?.nama_barang}`}
            visible={showLog}
            style={{ width: "70%" }}
            onHide={() => {
              if (!showLog) return;
              setShowLog(false);
            }}
          >
            <p className="m-0">
              <DataTable
                value={logs}
                paginator
                className="p-datatable-gridlines"
                onPage={(e) => {
                  setFirstLog(e.first);
                  setPageLog(Number(e.page) + 1);
                }}
                rows={logs.length}
                dataKey="id"
                totalRecords={totalLog}
                lazy
                first={firstLog}
                alwaysShowPaginator
                loading={isLoading}
                responsiveLayout="scroll"
                emptyMessage="No logs found."
                // header={header1}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} to {last} of {totalRecords} logs"
              >
                <Column
                  field="name"
                  header="User"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "4rem" }}
                  body={(el: any) => (
                    <p>
                      {users?.data?.find((item) => item.id === el.user_id)
                        ?.fullname ?? ""}
                    </p>
                  )}
                />
                <Column
                  field="description"
                  header="Module"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "4rem" }}
                  body={(el: any) => (
                    <p>{`${
                      el.endpoint === "/v1/login"
                        ? "Login"
                        : el.method === "POST"
                        ? "Create"
                        : el.method === "PUT"
                        ? "Update"
                        : "Delete"
                    } ${getModule(el.endpoint)} ${getName(
                      el.endpoint,
                      el.payload
                    )}`}</p>
                  )}
                />
                <Column
                  field="created_at"
                  header="Action Time"
                  filterPlaceholder="Search by name"
                  style={{ minWidth: "3rem" }}
                  body={(data: any) => (
                    <p>{moment(data.created_at as any).format("LLL")}</p>
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
            </p>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
