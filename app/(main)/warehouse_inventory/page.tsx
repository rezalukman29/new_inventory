"use client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { InventoryService } from "@/app/service/InventoryService";
import { currency, isValidUrl, noImage } from "@/app/util/function";
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
import { SortType } from "@/app/interfaces/interfaces";
import { STORAGE_BOOQABLE } from "@/app/util/config";
import { TabMenu } from "primereact/tabmenu";
import Loading from "@/app/components/atoms/loading";
import { Skeleton } from "primereact/skeleton";
import useWindowDimensions from "@/app/hooks/useWindowDimensions";

interface ISelect {
  label: string;
  value: string;
}

const items = [
  { label: "Inventory", icon: "pi pi-home" },
  { label: "Stock Opname", icon: "pi pi-chart-line" },
];

interface StockOpnameItem {
  id: string;
  stok: number;
}

const TableDemo = () => {
  const opMenu = useRef<any>(null);
  const { isAdmin } = useAccountController();
  const toast = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [listEvent, setListEvent] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const { width } = useWindowDimensions();
  const [page, setPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [pageOpname, setPageOpname] = useState<number>(1);
  const [firstOpname, setFirstOpname] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [totalPagesOpname, setTotalPagesOpname] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [totalOpname, setTotalOpname] = useState<number>(10);
  const [gudang, setGudang] = React.useState<any>([]);
  const [searchValue, setSearchValue] = useState("");
  const [listInventory, setListInventory] = useState<any[]>([]);
  const [selectedGudang, setSelectedGudang] = React.useState<any>({
    value: "All",
    label: "All warehouse",
  });
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [listBarang, setListBarang] = useState<any[]>([]);
  const [listOpname, setlistOpname] = useState<any[]>([]);
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
  const [sort, setSort] = useState<SortType>("ASC");
  const [sortBy, setSortBy] = useState<string>("nama_barang");
  const [sortOpname, setSortOpname] = useState<SortType>("DESC");
  const [sortByOpname, setSortByOpname] = useState<string>("created_at");
  const [isShowStockOpname, setIsShowStockOpname] = useState<boolean>(false);
  const [isStockOpname, setIsStockOpname] = useState<boolean>(false);
  const [selectedOpname, setSelectedOpname] = useState<any | null>(null);
  const [isApply, setIsApply] = useState<boolean>(false);
  const [isRollback, setIsRollback] = useState<boolean>(false);

  const [isModalDetailOpname, setIsModalDetailOpname] =
    useState<boolean>(false);
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
      valuation: isModify ? barang.valuation : "",
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

  const formOpname = useFormik<any>({
    initialValues: {
      period: "",
      remark: "",
      data: [],
    },
    validationSchema: Yup.object({
      period: Yup.string().required("Required"),
      remark: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isStockOpname) {
        setIsShowStockOpname(false);
        setIsStockOpname(false);
        try {
          setIsLoading(true);
          const response = await InventoryService.addStockOpname(values);
          toast?.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Create Stock Opname",
            life: 3000,
          });
          setIsLoading(false);
          formOpname.resetForm();
          getOpnameList();
        } catch (error: any) {
          setIsLoading(false);
          toast?.current?.show({
            severity: "error",
            summary: "Error",
            detail: error?.response.data.message,
            life: 3000,
          });
        }
      } else {
        setIsStockOpname(true);
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
        size ?? pageSize,
        sort,
        sortBy
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

  const getOpnameList = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getStockOpname(
        pageOpname,
        searchValue,
        size ?? pageSize,
        sortOpname,
        sortByOpname
      );
      setlistOpname(response.data);
      setTotalOpname(response.total_records);
      setTotalPagesOpname(response.total_pages);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setPageOpname(1);
      setFirstOpname(0);
      setlistOpname([]);
      setTotalOpname(0);
      setTotalPagesOpname(0);
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

  const onDeleteOpname = async (id: string) => {
    try {
      setIsLoading(true);
      await InventoryService.deleteStockOpname(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete stock opname",
        life: 3000,
      });
      getOpnameList();
      setIsLoading(false);
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

  const onApplyStockOpname = async (id: number) => {
    try {
      setIsLoading(true);
      await InventoryService.applyStockOpname(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Success apply stock opname",
        life: 3000,
      });
      setSelectedOpname(null);
      setIsApply(false);
      setIsRollback(false);
      getOpnameList();
      setIsLoading(false);
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

  const onRollbackStockOpname = async (id: string) => {
    try {
      setIsLoading(true);
      await InventoryService.rollbackStockOpname(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Success rollback stock opname",
        life: 3000,
      });
      setSelectedOpname(null);
      setIsApply(false);
      setIsRollback(false);
      getOpnameList();
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
        response.data.data.map((item: any) => {
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
    if (activeIndex === 1) {
      isShowStockOpname ? getInventoryList() : getOpnameList();
    } else {
      getInventoryList();
    }
  }, [page, sort, sortBy, activeIndex, pageOpname]);

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
        <div>
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
      </div>
    );
  };

  const renderHeader2 = () => {
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
                getInventoryList();
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
              onClick={() => setIsShowStockOpname(true)}
            />
          )}
        </div>
      </div>
    );
  };

  const header1 = renderHeader1();

  const header2 = renderHeader2();

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

  const opnameImage = (item: any) => {
    return (
      <img
        src={
          isValidUrl(item.barang.photo) &&
          item.barang.photo.includes("http://66.42.48.163:9000")
            ? item?.barang?.photo?.replace(
                "http://66.42.48.163:9000/booqable/",
                STORAGE_BOOQABLE
              )
            : item.barang.photo
            ? `https://democreation.site/home/public/${item.barang.photo}`
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

  const opnameDialogFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        severity="danger"
        onClick={() => {
          setIsModalDetailOpname(false);
          setSelectedOpname(null);
          setIsApply(false);
          setIsRollback(false);
        }}
        className="button"
      />
      <Button
        label={isApply ? "Apply" : "Rollback"}
        icon="pi pi-check"
        severity={isApply ? "success" : "info"}
        type="submit"
        onClick={() => {
          setIsModalDetailOpname(false);
          isApply
            ? onApplyStockOpname(selectedOpname?.id)
            : onRollbackStockOpname(selectedOpname?.id);
        }}
        className="button"
      />
    </>
  );

  const stockOpnameFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        severity="danger"
        onClick={() => {
          setIsShowStockOpname(false);
          setIsStockOpname(false);
          formOpname.resetForm();
        }}
        className="button"
      />
      <Button
        label={isStockOpname ? "Submit" : "Create"}
        icon="pi pi-check"
        severity="success"
        type="submit"
        onClick={() => formOpname.handleSubmit()}
        className="button"
        disabled={isStockOpname && !formOpname.values.data?.length}
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

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const onSortOpname = (field: string) => {
    setSortByOpname(field);
    setSortOpname(sort === "ASC" ? "DESC" : "ASC");
  };

  const onSetData = useCallback(
    (value: string, id: number) => {
      const isExisting = !!formOpname.values.data?.find(
        (el: any) => el.id === id
      );
      if (isExisting) {
        if (value === "") {
          return formOpname.setFieldValue(
            "data",
            formOpname.values.data?.filter((el: any) => el.id !== id)
          );
        } else {
          const updateExisting = formOpname.values.data?.map((el: any) => {
            return {
              id: el.id,
              stok: el.id === id ? Number(value) : el.stok,
            };
          });
          return formOpname.setFieldValue("data", updateExisting);
        }
      } else {
        return formOpname.setFieldValue("data", [
          ...formOpname.values.data,
          ...[
            {
              id,
              stok: Number(value),
            },
          ],
        ]);
      }
    },
    [formOpname.values.data]
  );

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div
        className="col-12"
        // style={{ backgroundColor: "red", flex: 1, overflow: "hidden" }}
      >
        <div className="card">
          <h5>Warehouse Inventory</h5>
          <TabMenu
            model={items}
            activeIndex={activeIndex}
            onTabChange={(e) => {
              setActiveIndex(e.index);
              setSearchValue("");
            }}
          />
          {activeIndex === 0 && (
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
              lazy
              totalRecords={total}
              tableStyle={{ width: 2200, fontSize: 13 }}
              first={first}
              alwaysShowPaginator
              loading={isLoading}
              scrollable
              responsiveLayout="scroll"
              emptyMessage="No customers found."
              header={header1}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="{first} to {last} of {totalRecords} warehouse inventory"
              onSort={(e) => onSort(e.sortField)}
              sortField={sortBy}
              sortOrder={sort === "ASC" ? 1 : -1}
            >
              <Column
                field="nama_barang"
                header="Name"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyClassName={classNames({ "font-bold": true })}
                frozen
                sortable
                sortField="nama_barang"
              />
              <Column
                field="stok_gudang"
                header="Warehouse Stock"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                headerStyle={{ justifyItems: "center" }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="stok_gudang"
              />
              <Column
                field="gudang_name"
                header="Warehouse Name"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
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
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="stok_barang"
              />
              <Column
                field="stok_minimum"
                header="Stok Min"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="stok_minimum"
              />
              <Column
                field="stock_used"
                header="Stok Used"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="stock_used"
              />
              <Column
                field="updated_at"
                header="Valuation"
                filterPlaceholder="Search by name"
                style={{ maxWidth: "9rem" }}
                body={(data: any) => (
                  <p>{data.valuation ? currency(data.valuation) : "0"}</p>
                )}
                sortable
                sortField="valuation"
              />
                            <Column
                field="updated_at"
                header="Total Valuation"
                filterPlaceholder="Search by name"
                style={{ maxWidth: "9rem" }}
                body={(data: any) => (
                  <p>{data.valuation ? currency(Number(data.valuation) * data.stok_barang) : "0"}</p>
                )}
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
                  const isNotSet =
                    data.stok_minimum === 0 || !data.stok_minimum;
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
                sortable
                sortField="flag_1"
              />
              <Column
                field="flag_2"
                header="Flag 2"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="flag_2"
              />
              <Column
                field="asile"
                header="Asile"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="asile"
              />
              <Column
                field="rack"
                header="Rack"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="rack"
              />
              <Column
                field="level"
                header="Level"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="level"
              />
              <Column
                field="lantai"
                header="Lantai"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="lantai"
              />
              <Column
                field="lorong"
                header="Lorong"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                sortable
                sortField="lorong"
              />
              <Column
                field="stok_minimum"
                header="Image"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
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
          )}
          {activeIndex === 1 && (
            <DataTable
              value={listOpname}
              paginator
              className="p-datatable-gridlines"
              onPage={(e) => {
                setFirstOpname(e.first);
                setPageOpname(Number(e.page) + 1);
              }}
              rows={pageSize}
              dataKey="id"
              lazy
              totalRecords={totalOpname}
              tableStyle={{ fontSize: 13 }}
              first={firstOpname}
              alwaysShowPaginator
              loading={isLoading}
              scrollable
              responsiveLayout="scroll"
              emptyMessage="No stock opname found."
              header={header2}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="{first} to {last} of {totalRecords} stock opname"
              onSort={(e) => onSortOpname(e.sortField)}
              sortField={sortByOpname}
              sortOrder={sortOpname === "ASC" ? 1 : -1}
            >
              <Column
                field="period"
                header="Period"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                bodyClassName={classNames({ "font-bold": true })}
                frozen
                sortable
                sortField="period"
              />
              <Column
                field="remark"
                header="Remark Stock"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                headerStyle={{ justifyItems: "center" }}
                sortable
                sortField="remark"
              />
              <Column
                field="gudang_name"
                header="Total Items"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                headerStyle={{ justifyItems: "center" }}
                bodyStyle={{ textAlign: "center" }}
                body={(data: any) => <p>{data.data.length} Items</p>}
              />
              <Column
                field="flag"
                header="Status"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
                headerStyle={{ justifyItems: "center" }}
                sortable
                sortField="flag"
              />

              <Column
                field="created_at"
                header="Created At"
                sortable
                sortField="created_at"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
                body={(data: any) => (
                  <p>
                    {moment(data.created_at as any).format("D MMM YYYY, HH:MM")}
                  </p>
                )}
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
                          onClick={(e) => {
                            setSelectedOpname(data);
                            setIsModalDetailOpname(true);
                          }}
                          // router.push(`/sub_area?id=${data.id}`)

                          className="pi pi-folder"
                          style={{ fontSize: 18, cursor: "pointer" }}
                        ></div>
                        <div
                          className="pi pi-trash"
                          onClick={() => onDeleteOpname(data.id)}
                          onMouseOver={() => setOver(data.id + "delete")}
                          onMouseOut={() => setOver("")}
                          style={{
                            fontSize: 18,
                            marginLeft: 12,
                            cursor: "pointer",
                            color:
                              over === data.id + "delete" ? "blue" : undefined,
                          }}
                        ></div>
                        <div
                          className={
                            data.flag === "draft" ? "pi pi-check" : "pi pi-undo"
                          }
                          onClick={() => {
                            setSelectedOpname(data);
                            setIsModalDetailOpname(true);
                            data.flag === "draft"
                              ? setIsApply(true)
                              : setIsRollback(true);
                          }}
                          onMouseOver={() => setOver(data.id + "option")}
                          onMouseOut={() => setOver("")}
                          style={{
                            fontSize: 18,
                            marginLeft: 12,
                            cursor: "pointer",
                            color:
                              over === data.id + "option"
                                ? "blue"
                                : data.flag === "draft"
                                ? "green"
                                : "red",
                          }}
                        ></div>
                        {/* <OverlayPanel ref={opMenu}>
                          <div
                            style={{
                              paddingLeft: 12,
                              paddingRight: 12,
                              cursor: "pointer",
                            }}
                            onClick={
                              () => console.log(data)
                              // data.flag === "draft"
                              //   ? onApplyStockOpname(data.id)
                              //   : onRollbackStockOpname(data.id)
                            }
                          >
                            <p className="text-lg">
                              {data.flag === "draft" ? "Apply" : "Rollback"}
                            </p>
                          </div>
                        </OverlayPanel>
                        <div
                          className="pi pi-ellipsis-v"
                          onClick={(e) => {
                            opMenu.current.toggle(e);
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
                        ></div> */}
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
          )}
          <Dialog
            visible={productDialog}
            style={{ width: width * 0.5 }}
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
                      width: "46%",
                      borderRadius: 12,
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
                              STORAGE_BOOQABLE
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
              <div className="field flex-1">
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
              <div className="field flex-1">
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
              <div className="field flex-1">
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
              <div className="field flex-1">
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
              <div className="field flex-1">
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
              <div className="field flex-1">
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
            <div className="flex flex-row items-center">
              <div className="field flex-1">
                <label htmlFor="name">Valuation</label>
                <InputText
                  id="name"
                  value={currency(Number(formik.values.valuation))}
                  onChange={(e) => {
                    let cleaned = e.target.value.replace(/[^0-9]/g, "");

                    // Hilangkan leading zero
                    if (cleaned.length > 1 && cleaned.startsWith("0")) {
                      cleaned = cleaned.replace(/^0+/, "");
                    }

                    formik.setFieldValue("valuation", cleaned);
                  }}
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.valuation
                      ? "border-red-600"
                      : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field flex-1">
                <label htmlFor="name">Warehouse</label>
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
              </div>
            </div>
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
                    <p>
                      {moment(data.created_at as any).format(
                        "D MMM YYYY, HH:MM"
                      )}
                    </p>
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
          <Dialog
            visible={isShowStockOpname}
            style={{ width: isStockOpname ? "900px" : "450px" }}
            header={"Stock Opname"}
            modal
            className="p-fluid"
            footer={stockOpnameFooter}
            onHide={() => {
              setIsShowStockOpname(false);
              setIsStockOpname(false);
              formOpname.resetForm();
            }}
          >
            <div className="field">
              <label htmlFor="name">Period</label>
              <InputText
                id="name"
                value={formOpname.values.period}
                onChange={(e) =>
                  formOpname.setFieldValue("period", e.target.value)
                }
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formOpname.errors.period
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="field">
              <label htmlFor="name">Remark</label>
              <InputText
                id="name"
                value={formOpname.values.remark}
                onChange={(e) =>
                  formOpname.setFieldValue("remark", e.target.value)
                }
                className={`text-black border w-full py-2 px-4 ${
                  formOpname.errors.remark
                    ? "border-red-600"
                    : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            {isStockOpname && (
              <>
                {/* {isLoading ? (
                  <Loading />
                ) : ( */}
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
                  lazy
                  totalRecords={total}
                  tableStyle={{ width: "100%", fontSize: 13 }}
                  first={first}
                  alwaysShowPaginator
                  loading={isLoading}
                  scrollable
                  responsiveLayout="scroll"
                  emptyMessage="No customers found."
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="{first} to {last} of {totalRecords} warehouse inventory"
                  onSort={(e) => onSort(e.sortField)}
                  sortField={sortBy}
                  sortOrder={sort === "ASC" ? 1 : -1}
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
                    field="address"
                    header="New Stock"
                    headerStyle={{ justifyItems: "center" }}
                    style={{ width: 200, paddingTop: 8, paddingBottom: 8 }}
                    bodyStyle={{ textAlign: "center" }}
                    body={
                      isLoading ? (
                        <Skeleton height="36px" />
                      ) : (
                        (data) => {
                          const value = formOpname.values.data?.find(
                            (el: any) => el.id === data.barang_gudang_id
                          )?.stok;
                          return (
                            <div>
                              <InputText
                                id="name"
                                keyfilter="int"
                                value={value ? value.toString() : undefined}
                                onChange={(e) =>
                                  onSetData(
                                    e.target.value,
                                    data.barang_gudang_id
                                  )
                                }
                                autoFocus
                                className={`text-black border w-full py-2 px-4 "border-gray-300"
                             rounded-lg bg-transparent`}
                              />
                            </div>
                          );
                        }
                      )
                    }
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
                {/* )} */}
              </>
            )}
          </Dialog>
          <Dialog
            header={`Period: ${selectedOpname?.period}`}
            visible={isModalDetailOpname}
            style={{ width: "70%" }}
            onHide={() => {
              if (!isModalDetailOpname) return;
              setIsModalDetailOpname(false);
              setSelectedOpname(null);
              setIsApply(false);
              setIsRollback(false);
            }}
            footer={isApply || isRollback ? opnameDialogFooter : undefined}
          >
            <p className="m-0">
              <DataTable
                value={selectedOpname?.data ?? []}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: "50rem" }}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
              >
                <Column
                  field="barang.nama"
                  header="Name"
                  style={{ width: "10%" }}
                  body={opnameImage}
                ></Column>
                <Column
                  field="barang.nama"
                  header="Name"
                  style={{ width: "40%" }}
                ></Column>
                <Column
                  field={"stock_old"}
                  header="Stock Old"
                  bodyStyle={{ textAlign: "center" }}
                  headerStyle={{ justifyItems: "center" }}
                  style={{ width: "10%" }}
                ></Column>
                <Column
                  field="stock_new"
                  header="Stock New"
                  headerStyle={{ justifyItems: "center" }}
                  bodyStyle={{ textAlign: "center" }}
                  style={{ width: "10%" }}
                ></Column>
                <Column
                  field="comparison"
                  header="Comparison"
                  headerStyle={{ justifyItems: "center" }}
                  bodyStyle={{ textAlign: "center" }}
                  style={{ width: "10%" }}
                ></Column>
                <Column
                  field="barang.gudang_name"
                  header="Warehouse"
                  style={{ width: "20%" }}
                ></Column>
              </DataTable>
            </p>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
