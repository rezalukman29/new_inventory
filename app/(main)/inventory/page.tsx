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
import React, { useEffect, useRef, useState } from "react";
import type { Demo } from "@/types";
import { InventoryService } from "@/app/service/InventoryService";
import { isValidUrl, noImage } from "@/app/util/function";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Icon } from "@iconify/react";
import { ConfirmDialog } from "primereact/confirmdialog";
import { OverlayPanel } from "primereact/overlaypanel";
import Loading from "@/app/components/atoms/loading";
import { getLogActivity } from "@/app/hooks/api/useGetLogActivity";
import useGetEmiUser from "@/app/hooks/api/useGetEmiUser";
import moment from "moment";
import { SortType } from "@/app/interfaces/interfaces";

interface ISelect {
  label: string;
  value: string;
}

const TableDemo = () => {
  const toast = useRef<any>(null);
  const op = useRef<any>(null);
  const opMenu = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [listBarang, setListBarang] = useState<any[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [itemDetal, setItemDetail] = useState<boolean>(false);

  const [listSatuan, setListSatuan] = useState<ISelect[]>([]);
  const [listCategory, setListCategory] = useState<ISelect[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [barang, setBarang] = useState<any | null>(null);
  const [page, setPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [searchValue, setSearchValue] = useState("");
  const [file, setFile] = useState<string>();
  const [imagePreview, setImagePreview] = useState<any>("");
  const [base64, setBase64] = useState<string>();
  const [productDialog, setProductDialog] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const [pageLog, setPageLog] = useState<number>(1);
  const [totalLog, setTotalLog] = useState<number>(10);
  const [firstLog, setFirstLog] = useState<number>(0);
  const [sort, setSort] = useState<SortType>("ASC");
  const [sortBy, setSortBy] = useState<string>("name");

  const onPageChange = (page: number) => setPage(page);

  const formik = useFormik<any>({
    initialValues: {
      nama: isModify ? barang.nama : "",
      detail: isModify ? barang.detail : "",
      code: isModify ? barang.code : "",
      kategori_id: isModify ? barang.kategori_id.toString() : "",
      satuan_id: isModify ? barang.satuan_id.toString() : "",
      stok: isModify ? barang.stok_barang.toString() : "",
      panjang: isModify ? barang.panjang : "",
      lebar: isModify ? barang.lebar : "",
      tinggi: isModify ? barang.tinggi : "",
      berat: isModify ? barang.berat : "",
      lantai: isModify ? barang.lantai : "",
      lorong: isModify ? barang.lorong : "",
      rack: isModify ? barang.rack : "",
    },
    validationSchema: Yup.object({
      nama: Yup.string().required("Required"),
      code: Yup.string().required("Required"),
      kategori_id: Yup.string().required("Required"),
      satuan_id: Yup.string().required("Required"),
      stok: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const payload = {
        ...values,
        satuan_id: Number(values.satuan_id),
        kategori_id: Number(values.kategori_id),
        stok: Number(values.stok),
      };
      if (isModify) {
        try {
          const result: APIResponse<any> = await InventoryService.editBarang({
            ...payload,
            id: barang.id,
            ...(base64 && { photo: base64?.split(",")[1] as string }),
          });
          if (result.success) {
            setTimeout(() => {
              setProductDialog(false);
            }, 200);
            toast?.current?.show({
              severity: "success",
              summary: "Success",
              detail: "Modify inventory",
              life: 3000,
            });
            setIsModify(false);
            setBase64("");
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
          const result: APIResponse<any> = await InventoryService.addBarang({
            ...payload,
            photo: base64?.split(",")[1] as string,
          });
          if (result.success) {
            setTimeout(() => {
              setProductDialog(false);
            }, 200);
            toast?.current?.show({
              severity: "success",
              summary: "Success",
              detail: "Adding inventory",
              life: 3000,
            });
            setIsModify(false);
            setBase64("");
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
      }
    },
  });

  const getInventoryList = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getInventory({
        order: "asc",
        page,
        limit: size ?? pageSize,
        search: searchValue,
        sort,
        sortBy,
      });
      setListBarang(response.data.data);
      setTotal(response.data.total_records);
      setTotalPages(response.data.total_pages);
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

  const getSatuan = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getSatuan();
      setListSatuan(
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

  const onDeleteItem = async (id: string) => {
    try {
      setDeleteConfirmation(false);
      setIsLoading(true);
      await InventoryService.deleteBarang(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete inventory",
        life: 3000,
      });
      getInventoryList();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInventoryList();
  }, [page, sort, sortBy]);

  useEffect(() => {
    getInventoryList();
    getSatuan();
    getItemCategory();
  }, []);

  const [customers1, setCustomers1] = useState<Demo.Customer[]>([]);
  const [customers2, setCustomers2] = useState<Demo.Customer[]>([]);
  const [customers3, setCustomers3] = useState<Demo.Customer[]>([]);
  const [filters1, setFilters1] = useState<DataTableFilterMeta>({});
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [idFrozen, setIdFrozen] = useState(false);
  const [products, setProducts] = useState<Demo.Product[]>([]);
  const [globalFilterValue1, setGlobalFilterValue1] = useState("");
  const [expandedRows, setExpandedRows] = useState<
    any[] | DataTableExpandedRows
  >([]);
  const [allExpanded, setAllExpanded] = useState(false);

  const representatives = [
    { name: "Amy Elsner", image: "amyelsner.png" },
    { name: "Anna Fali", image: "annafali.png" },
    { name: "Asiya Javayant", image: "asiyajavayant.png" },
    { name: "Bernardo Dominic", image: "bernardodominic.png" },
    { name: "Elwin Sharvill", image: "elwinsharvill.png" },
    { name: "Ioni Bowcher", image: "ionibowcher.png" },
    { name: "Ivan Magalhaes", image: "ivanmagalhaes.png" },
    { name: "Onyama Limba", image: "onyamalimba.png" },
    { name: "Stephen Shaw", image: "stephenshaw.png" },
    { name: "XuXue Feng", image: "xuxuefeng.png" },
  ];

  const statuses = [
    "unqualified",
    "qualified",
    "new",
    "negotiation",
    "renewal",
    "proposal",
  ];

  const clearFilter1 = () => {
    initFilters1();
  };

  const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters1 = { ...filters1 };
    (_filters1["global"] as any).value = value;

    setFilters1(_filters1);
    setGlobalFilterValue1(value);
  };

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

  useEffect(() => {
    setLoading2(true);

    CustomerService.getCustomersLarge().then((data) => {
      setCustomers1(getCustomers(data));
      setLoading1(false);
    });
    CustomerService.getCustomersLarge().then((data) => {
      setCustomers2(getCustomers(data));
      setLoading2(false);
    });
    CustomerService.getCustomersMedium().then((data) => setCustomers3(data));
    ProductService.getProductsWithOrdersSmall().then((data) =>
      setProducts(data)
    );

    initFilters1();
  }, []);

  const balanceTemplate = (rowData: Demo.Customer) => {
    return (
      <div>
        <span className="text-bold">
          {formatCurrency(rowData.balance as number)}
        </span>
      </div>
    );
  };

  const getCustomers = (data: Demo.Customer[]) => {
    return [...(data || [])].map((d) => {
      d.date = new Date(d.date);
      return d;
    });
  };

  const formatDate = (value: Date) => {
    return value.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const initFilters1 = () => {
    setFilters1({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      "country.name": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      representative: { value: null, matchMode: FilterMatchMode.IN },
      date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      balance: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      status: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
      verified: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    setGlobalFilterValue1("");
  };

  const countryBodyTemplate = (rowData: Demo.Customer) => {
    return (
      <React.Fragment>
        <img
          alt="flag"
          src={`/demo/images/flag/flag_placeholder.png`}
          className={`flag flag-${rowData.country.code}`}
          width={30}
        />
        <span style={{ marginLeft: ".5em", verticalAlign: "middle" }}>
          {rowData.country.name}
        </span>
      </React.Fragment>
    );
  };

  const filterClearTemplate = (options: ColumnFilterClearTemplateOptions) => {
    return (
      <Button
        type="button"
        icon="pi pi-times"
        onClick={options.filterClearCallback}
        severity="secondary"
      ></Button>
    );
  };

  const filterApplyTemplate = (options: ColumnFilterApplyTemplateOptions) => {
    return (
      <Button
        type="button"
        icon="pi pi-check"
        onClick={options.filterApplyCallback}
        severity="success"
      ></Button>
    );
  };

  const representativeBodyTemplate = (rowData: Demo.Customer) => {
    const representative = rowData.representative;
    return (
      <React.Fragment>
        <img
          alt={representative.name}
          src={`/demo/images/avatar/${representative.image}`}
          onError={(e) =>
            ((e.target as HTMLImageElement).src =
              "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
          }
          width={32}
          style={{ verticalAlign: "middle" }}
        />
        <span style={{ marginLeft: ".5em", verticalAlign: "middle" }}>
          {representative.name}
        </span>
      </React.Fragment>
    );
  };

  const representativeFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => {
    return (
      <>
        <div className="mb-3 text-bold">Agent Picker</div>
        <MultiSelect
          value={options.value}
          options={representatives}
          itemTemplate={representativesItemTemplate}
          onChange={(e) => options.filterCallback(e.value)}
          optionLabel="name"
          placeholder="Any"
          className="p-column-filter"
        />
      </>
    );
  };

  const representativesItemTemplate = (option: any) => {
    return (
      <div className="p-multiselect-representative-option">
        <img
          alt={option.name}
          src={`/demo/images/avatar/${option.image}`}
          width={32}
          style={{ verticalAlign: "middle" }}
        />
        <span style={{ marginLeft: ".5em", verticalAlign: "middle" }}>
          {option.name}
        </span>
      </div>
    );
  };

  const dateBodyTemplate = (rowData: Demo.Customer) => {
    return formatDate(rowData.date);
  };

  const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="mm/dd/yy"
        placeholder="mm/dd/yyyy"
        mask="99/99/9999"
      />
    );
  };

  const balanceBodyTemplate = (rowData: Demo.Customer) => {
    return formatCurrency(rowData.balance as number);
  };

  const balanceFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => {
    return (
      <InputNumber
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    );
  };

  const statusBodyTemplate = (rowData: Demo.Customer) => {
    return (
      <span className={`customer-badge status-${rowData.status}`}>
        {rowData.status}
      </span>
    );
  };

  const statusFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={statusItemTemplate}
        placeholder="Select a Status"
        className="p-column-filter"
        showClear
      />
    );
  };

  const statusItemTemplate = (option: any) => {
    return <span className={`customer-badge status-${option}`}>{option}</span>;
  };

  const activityBodyTemplate = (rowData: Demo.Customer) => {
    return (
      <ProgressBar
        value={rowData.activity}
        showValue={false}
        style={{ height: ".5rem" }}
      ></ProgressBar>
    );
  };

  const activityFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => {
    return (
      <React.Fragment>
        <Slider
          value={options.value}
          onChange={(e) => options.filterCallback(e.value)}
          range
          className="m-3"
        ></Slider>
        <div className="flex align-items-center justify-content-between px-2">
          <span>{options.value ? options.value[0] : 0}</span>
          <span>{options.value ? options.value[1] : 100}</span>
        </div>
      </React.Fragment>
    );
  };

  const verifiedBodyTemplate = (rowData: Demo.Customer) => {
    return (
      <i
        className={classNames("pi", {
          "text-green-500 pi-check-circle": rowData.verified,
          "text-pink-500 pi-times-circle": !rowData.verified,
        })}
      ></i>
    );
  };

  const verifiedFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => {
    return (
      <TriStateCheckbox
        value={options.value}
        onChange={(e) => options.filterCallback(e.value)}
      />
    );
  };

  const toggleAll = () => {
    if (allExpanded) collapseAll();
    else expandAll();
  };

  const expandAll = () => {
    let _expandedRows = {} as { [key: string]: boolean };
    products.forEach((p) => (_expandedRows[`${p.id}`] = true));

    setExpandedRows(_expandedRows);
    setAllExpanded(true);
  };

  const collapseAll = () => {
    setExpandedRows([]);
    setAllExpanded(false);
  };

  const amountBodyTemplate = (rowData: Demo.Customer) => {
    return formatCurrency(rowData.amount as number);
  };

  const statusOrderBodyTemplate = (rowData: Demo.Customer) => {
    return (
      <span className={`order-badge order-${rowData.status?.toLowerCase()}`}>
        {rowData.status}
      </span>
    );
  };

  const searchBodyTemplate = () => {
    return <Button icon="pi pi-search" />;
  };

  const imageBodyTemplate = (rowData: Demo.Product) => {
    return (
      <img
        src={`/demo/images/product/${rowData.image}`}
        onError={(e) =>
          ((e.target as HTMLImageElement).src =
            "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
        }
        alt={rowData.image}
        className="shadow-2"
        width={100}
      />
    );
  };

  const inventoryImage = (item: any) => {
    return (
      <div
        onClick={(e) => {
          setBarang(item);
          setItemDetail(true);
          op?.current?.toggle(e);
        }}
      >
        <img
          src={
            isValidUrl(item.photo)
              ? item.photo?.replace(
                  "http://66.42.48.163:9000/booqable/",
                  "https://storage-booqable.emi-project.my.id/booqable/"
                )
              : item.photo
              ? `https://democreation.site/home/public/${item.photo}`
              : noImage
          }
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            cursor: "pointer",
          }}
        />
      </div>
    );
  };

  const inventoryCategory = (item: any) => {
    return (
      <p>
        {item?.kategori_barang?.name ??
          listCategory?.find((el) => Number(el.value) === item?.kategori_id)
            ?.label ??
          ""}
      </p>
    );
  };

  const inventoryWarehouse = (item: any) => {
    return (
      <p>
        {item?.barang_gudang?.length
          ? item?.barang_gudang[0]?.gudang?.nama
          : ""}
      </p>
    );
  };

  const priceBodyTemplate = (rowData: Demo.Product) => {
    return formatCurrency(rowData.price as number);
  };

  const ratingBodyTemplate = (rowData: Demo.Product) => {
    return <Rating value={rowData.rating} readOnly cancel={false} />;
  };

  const statusBodyTemplate2 = (rowData: Demo.Product) => {
    return (
      <span
        className={`product-badge status-${rowData.inventoryStatus?.toLowerCase()}`}
      >
        {rowData.inventoryStatus}
      </span>
    );
  };

  const rowExpansionTemplate = (data: Demo.Product) => {
    return (
      <div className="orders-subtable">
        <h5>Orders for {data.name}</h5>
        <DataTable value={data.orders} responsiveLayout="scroll">
          <Column field="id" header="Id" sortable></Column>
          <Column field="customer" header="Customer" sortable></Column>
          <Column field="date" header="Date" sortable></Column>
          <Column
            field="amount"
            header="Amount"
            body={amountBodyTemplate}
            sortable
          ></Column>
          <Column
            field="status"
            header="Status"
            body={statusOrderBodyTemplate}
            sortable
          ></Column>
          <Column
            headerStyle={{ width: "4rem" }}
            body={searchBodyTemplate}
          ></Column>
        </DataTable>
      </div>
    );
  };

  const header = (
    <Button
      icon={allExpanded ? "pi pi-minus" : "pi pi-plus"}
      label={allExpanded ? "Collapse All" : "Expand All"}
      onClick={toggleAll}
      className="w-11rem"
    />
  );

  const headerTemplate = (data: Demo.Customer) => {
    return (
      <React.Fragment>
        <img
          alt={data.representative.name}
          src={`/demo/images/avatar/${data.representative.image}`}
          width="32"
          style={{ verticalAlign: "middle" }}
        />
        <span className="font-bold ml-2">{data.representative.name}</span>
      </React.Fragment>
    );
  };

  const footerTemplate = (data: Demo.Customer) => {
    return (
      <React.Fragment>
        <td
          colSpan={4}
          style={{ textAlign: "right" }}
          className="text-bold pr-6"
        >
          Total Customers
        </td>
        <td>{calculateCustomerTotal(data.representative.name)}</td>
      </React.Fragment>
    );
  };

  const calculateCustomerTotal = (name: string) => {
    let total = 0;

    if (customers3) {
      for (let customer of customers3) {
        if (customer.representative.name === name) {
          total++;
        }
      }
    }

    return total;
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

  const getLogs = async () => {
    try {
      opMenu.current.hide();
      const response = await getLogActivity({
        page: pageLog,
        limit: 10,
        module: "v1/barang",
        barang_id: barang.id,
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

  const Label = (label: string) => {
    return (
      <div style={{ flexDirection: "row" }}>
        <label htmlFor="name">{label}</label>
        <label htmlFor="name" style={{ color: "red" }}>
          *
        </label>
      </div>
    );
  };

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Inventory</h5>
          <ConfirmDialog
            visible={deleteConfirmation}
            onHide={() => {
              setDeleteConfirmation(false);
              setBarang(null);
            }}
            message={`Are you sure you want to delete ${barang?.nama}?`}
            header="Delete Confirmation"
            icon="pi pi-exclamation-triangle"
            accept={() => onDeleteItem(barang.id)}
            reject={() => {
              setDeleteConfirmation(false);
              setBarang(null);
            }}
          />
          <OverlayPanel ref={op}>
            <img
              src={
                isValidUrl(barang?.photo)
                  ? barang?.photo?.replace(
                      "http://66.42.48.163:9000/booqable/",
                      "https://storage-booqable.emi-project.my.id/booqable/"
                    )
                  : barang?.photo
                  ? `https://democreation.site/home/public/${barang?.photo}`
                  : noImage
              }
              style={{
                width: 500,
                height: "100%",
                borderRadius: 8,
                cursor: "pointer",
                objectFit: "cover",
              }}
            />
            <p style={{ fontSize: 16, marginTop: 16, fontWeight: "bold" }}>
              {barang?.nama}
            </p>
          </OverlayPanel>
          {isLoading ? (
            <Loading />
          ) : (
            <DataTable
              value={listBarang}
              paginator
              className="p-datatable-gridlines"
              onPage={(e) => {
                setFirst(e.first);
                setPage(Number(e.page) + 1);
              }}
              rows={10}
              dataKey="id"
              totalRecords={total}
              lazy
              first={first}
              alwaysShowPaginator
              tableStyle={{ width: 1800 }}
              loading={isLoading}
              responsiveLayout="scroll"
              emptyMessage="No customers found."
              header={header1}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="{first} to {last} of {totalRecords} inventory"
              onSort={(e) => onSort(e.sortField)}
              sortField={sortBy}
              sortOrder={sort === 'ASC' ? 1 : -1}
            >
              <Column
                field="nama"
                header="Name"
                filterPlaceholder="Search by name"
                style={{ minWidth: "12rem" }}
                sortable
                sortField="name"
              />
              <Column
                field="stok_barang"
                header="Stok"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem" }}
                sortable
                sortField="stock"
              />
              <Column
                field="stok_barang"
                header="Stok All"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem" }}
                body={(data: any) => {
                  return (
                    <p>
                      {data.barang_gudang?.reduce(
                        (accumulator: any, object: any) => {
                          return accumulator + Number(object.stok);
                        },
                        0
                      )}
                    </p>
                  );
                }}
                sortable
                sortField="stok_all"
              />
              <Column
                field="satuan.name"
                header="Satuan"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem" }}
                sortable
                sortField="satuan"
              />
              <Column
                field="satuan.name"
                header="Image"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem" }}
                body={inventoryImage}
              />
              <Column
                field="satuan.name"
                header="Category"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem" }}
                body={inventoryCategory}
                sortable
                sortField="category"
              />
              <Column
                field="satuan.name"
                header="Warehouse"
                filterPlaceholder="Search by name"
                style={{ minWidth: "4rem" }}
                body={inventoryWarehouse}
                sortable
                sortField="warehouse"
              />
              <Column
                field="address"
                header="Action"
                headerStyle={{ justifyItems: "center" }}
                filterPlaceholder="Search by name"
                style={{ width: 120 }}
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
                        }}
                        onMouseOver={() => setOver(data.id + "edit")}
                        onMouseOut={() => setOver("")}
                        className="pi pi-file-edit"
                        style={{
                          fontSize: 18,
                          cursor: "pointer",
                          color: over === data.id + "edit" ? "blue" : undefined,
                        }}
                      ></div>
                      <div
                        className="pi pi-trash hover:bg-red"
                        onClick={() => {
                          setBarang(data);
                          setDeleteConfirmation(true);
                        }}
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
                        onMouseOver={() => setOver(data.id + "more")}
                        onMouseOut={() => setOver("")}
                        onClick={(e) => {
                          opMenu.current.toggle(e);
                          setBarang(data);
                          setFirstLog(0);
                          setPageLog(1);
                        }}
                        style={{
                          fontSize: 18,
                          marginLeft: 12,
                          cursor: "pointer",
                          color: over === data.id + "more" ? "blue" : undefined,
                          // ...buttonstyle
                        }}
                      ></div>
                    </div>
                  );
                }}
              />
              {/* <Column header="Stok" filterField="country.name" style={{ minWidth: '12rem' }} body={countryBodyTemplate} filterPlaceholder="Search by country" filterClear={filterClearTemplate} filterApply={filterApplyTemplate} />
                        <Column
                            header="Agent"
                            filterField="representative"
                            showFilterMatchModes={false}
                            filterMenuStyle={{ width: '14rem' }}
                            style={{ minWidth: '14rem' }}
                            body={representativeBodyTemplate}

                            filterElement={representativeFilterTemplate}
                        />
                        <Column header="Date" filterField="date" dataType="date" style={{ minWidth: '10rem' }} body={dateBodyTemplate} filterElement={dateFilterTemplate} />
                        <Column header="Balance" filterField="balance" dataType="numeric" style={{ minWidth: '10rem' }} body={balanceBodyTemplate} filterElement={balanceFilterTemplate} />
                        <Column field="status" header="Status" filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '12rem' }} body={statusBodyTemplate} filterElement={statusFilterTemplate} />
                        <Column field="activity" header="Activity" showFilterMatchModes={false} style={{ minWidth: '12rem' }} body={activityBodyTemplate} filter filterElement={activityFilterTemplate} />
                        <Column field="verified" header="Verified" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} body={verifiedBodyTemplate} filter filterElement={verifiedFilterTemplate} /> */}
            </DataTable>
          )}

          <Dialog
            visible={productDialog}
            style={{ width: "800px" }}
            header={isModify ? "Modify Inventory" : "Add Inventory"}
            modal
            className="p-fluid"
            footer={productDialogFooter}
            onHide={hideDialog}
          >
            <div className="field">
              {Label("Name")}
              <InputText
                id="name"
                value={formik.values.nama}
                onChange={(e) => {
                  formik.setFieldValue("nama", e.target.value);
                  formik.setFieldError("nama", undefined)
                }}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.nama ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="name">Image</label>
              <div style={{ paddingTop: 8, paddingBottom: 8 }}>
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
                      {isModify && barang.photo ? (
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
                                barang.photo?.includes("66.42.48.163")
                                  ? barang.photo?.replace(
                                      "http://66.42.48.163:9000/booqable/",
                                      "https://storage-booqable.emi-project.my.id/booqable/"
                                    )
                                  : barang.photo
                                  ? `https://democreation.site/home/public/${barang.photo}`
                                  : noImage
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
            <div className="flex flex-row items-center">
              <div className="field" style={{ flex: 1 }}>
                {Label("Item Code")}
                <InputText
                  id="code"
                  value={formik.values.code}
                  onChange={(e) => {
                    formik.setFieldValue("code", e.target.value);
                    formik.setFieldError("code", undefined);
                  }}
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.code ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field" style={{ flex: 1 }}>
                {Label("Stock")}
                <InputText
                  id="stok"
                  value={formik.values.stok}
                  type="number"
                  onChange={(e) => {
                    formik.setFieldValue("stok", e.target.value);
                    formik.setFieldError("stok", undefined);
                  }}
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.stok ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="detail">Description</label>
              <InputText
                id="detail"
                value={formik.values.detail}
                onChange={(e) => formik.setFieldValue("detail", e.target.value)}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.detail ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="flex flex-row items-center">
              <div className="field flex-1">
                {Label("Unit")}
                <Dropdown
                  onChange={(e) => {
                    formik.setFieldValue("satuan_id", e.target.value);
                    formik.setFieldError("satuan_id", undefined);
                  }}
                  value={formik.values.satuan_id}
                  options={[
                    // ...[{ value: "", label: "Choose unit" }],
                    ...listSatuan,
                  ]}
                  optionLabel="label"
                  placeholder="Select unit"
                  className="flex-1"
                  style={{
                    ...(formik.errors.satuan_id && { borderColor: "red" }),
                  }}
                  // style={{ width: "100%"}}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field flex-1">
                {Label("Category")}
                <Dropdown
                  onChange={(e) => {
                    formik.setFieldValue("kategori_id", e.target.value);
                    formik.setFieldError("kategori_id", undefined);
                  }}
                  value={formik.values.kategori_id}
                  options={[
                    // ...[{ value: "", label: "Choose category" }],
                    ...listCategory,
                  ]}
                  optionLabel="label"
                  placeholder="Select category"
                  className="flex-1"
                  style={{
                    ...(formik.errors.kategori_id && { borderColor: "red" }),
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="panjang">Panjang</label>
                <InputText
                  id="panjang"
                  value={formik.values.panjang}
                  type="number"
                  onChange={(e) =>
                    formik.setFieldValue("panjang", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.panjang ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="lebar">Lebar</label>
                <InputText
                  id="lebar"
                  value={formik.values.lebar}
                  type="number"
                  onChange={(e) =>
                    formik.setFieldValue("lebar", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.lebar ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="panjang">Tinggi</label>
                <InputText
                  id="panjang"
                  value={formik.values.tinggi}
                  type="number"
                  onChange={(e) =>
                    formik.setFieldValue("tinggi", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.tinggi ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="berat">Berat</label>
                <InputText
                  id="berat"
                  value={formik.values.berat}
                  onChange={(e) =>
                    formik.setFieldValue("berat", e.target.value)
                  }
                  autoFocus
                  className={`text-black border w-full py-2 px-4 ${
                    formik.errors.berat ? "border-red-600" : "border-gray-300"
                  } rounded-lg bg-transparent`}
                />
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="lantai">Lantai</label>
                <InputText
                  id="lantai"
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
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="lorong">Lorong</label>
                <InputText
                  id="lorong"
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
          </Dialog>
          <Dialog
            header={`Log: ${barang?.nama}`}
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

      {/* <div className="col-12">
                <div className="card">
                    <h5>Frozen Columns</h5>
                    <ToggleButton checked={idFrozen} onChange={(e) => setIdFrozen(e.value)} onIcon="pi pi-lock" offIcon="pi pi-lock-open" onLabel="Unfreeze Id" offLabel="Freeze Id" style={{ width: '10rem' }} />

                    <DataTable value={customers2} scrollable scrollHeight="400px" loading={loading2} className="mt-3">
                        <Column field="name" header="Name" style={{ flexGrow: 1, flexBasis: '160px' }} frozen className="font-bold"></Column>
                        <Column field="id" header="Id" style={{ flexGrow: 1, flexBasis: '100px' }} frozen={idFrozen} alignFrozen="left" bodyClassName={classNames({ 'font-bold': idFrozen })}></Column>
                        <Column field="country.name" header="Country" style={{ flexGrow: 1, flexBasis: '200px' }} body={countryBodyTemplate}></Column>
                        <Column field="date" header="Date" style={{ flexGrow: 1, flexBasis: '200px' }} body={dateBodyTemplate}></Column>
                        <Column field="company" header="Company" style={{ flexGrow: 1, flexBasis: '200px' }}></Column>
                        <Column field="status" header="Status" style={{ flexGrow: 1, flexBasis: '200px' }} body={statusBodyTemplate}></Column>
                        <Column field="activity" header="Activity" style={{ flexGrow: 1, flexBasis: '200px' }}></Column>
                        <Column field="representative.name" header="Representative" style={{ flexGrow: 1, flexBasis: '200px' }} body={representativeBodyTemplate}></Column>
                        <Column field="balance" header="Balance" body={balanceTemplate} frozen style={{ flexGrow: 1, flexBasis: '120px' }} className="font-bold" alignFrozen="right"></Column>
                    </DataTable>
                </div>
            </div>

            <div className="col-12">
                <div className="card">
                    <h5>Row Expand</h5>
                    <DataTable value={products} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)} responsiveLayout="scroll" rowExpansionTemplate={rowExpansionTemplate} dataKey="id" header={header}>
                        <Column expander style={{ width: '3em' }} />
                        <Column field="name" header="Name" sortable />
                        <Column header="Image" body={imageBodyTemplate} />
                        <Column field="price" header="Price" sortable body={priceBodyTemplate} />
                        <Column field="category" header="Category" sortable />
                        <Column field="rating" header="Reviews" sortable body={ratingBodyTemplate} />
                        <Column field="inventoryStatus" header="Status" sortable body={statusBodyTemplate2} />
                    </DataTable>
                </div>
            </div>

            <div className="col-12">
                <div className="card">
                    <h5>Subheader Grouping</h5>
                    <DataTable
                        value={customers3}
                        rowGroupMode="subheader"
                        groupRowsBy="representative.name"
                        sortMode="single"
                        sortField="representative.name"
                        sortOrder={1}
                        scrollable
                        scrollHeight="400px"
                        rowGroupHeaderTemplate={headerTemplate}
                        rowGroupFooterTemplate={footerTemplate}
                        responsiveLayout="scroll"
                    >
                        <Column field="name" header="Name" style={{ minWidth: '200px' }}></Column>
                        <Column field="country" header="Country" body={countryBodyTemplate} style={{ minWidth: '200px' }}></Column>
                        <Column field="company" header="Company" style={{ minWidth: '200px' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} style={{ minWidth: '200px' }}></Column>
                        <Column field="date" header="Date" style={{ minWidth: '200px' }}></Column>
                    </DataTable>
                </div>
            </div> */}
    </div>
  );
};

export default TableDemo;
