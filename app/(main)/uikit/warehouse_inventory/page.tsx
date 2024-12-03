"use client";
import { CustomerService } from "../../../../demo/service/CustomerService";
import { ProductService } from "../../../../demo/service/ProductService";
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
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import useGetEventStatus from "@/app/hooks/api/useGetEventStatus";
import moment from "moment";
import { Toast } from "primereact/toast";

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

  const onChangeStatus = (e: any) => {
    setSelectedStatus(e.target.value);
  };

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
              headerStyle={{justifyItems: 'center'}}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="stok_gudang"
              header="Warehouse Stock"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              headerStyle={{justifyItems: 'center'}}
              bodyStyle={{textAlign: 'center'}}
            />
            <Column
              field="stok_barang"
              header="Item Stock"
              headerStyle={{justifyItems: 'center'}}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{textAlign: 'center'}}
            />
            <Column
              field="stok_minimum"
              header="Stok Min"
              headerStyle={{justifyItems: 'center'}}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{textAlign: 'center'}}
            />
            <Column
              field="stok_minimum"
              header="Image"
              headerStyle={{justifyItems: 'center'}}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              body={inventoryImage}
              bodyStyle={{padding: 4, textAlign: 'center'}}
            />
            <Column
              field="address"
              header="Action"
              headerStyle={{justifyItems: 'center'}}
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem" }}
              bodyStyle={{textAlign: 'center'}}
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
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
