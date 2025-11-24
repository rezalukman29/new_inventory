"use client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";
import { InventoryService } from "@/app/service/InventoryService";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import { Toast } from "primereact/toast";
import "../index.css";
import useAccountController from "../useAccountController";

const TableDemo = () => {
  const toast = useRef<any>(null);
  const { isAdmin } = useAccountController();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [listArea, setListArea] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [height] = useDeviceSize();
  const [page, setPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [gudang, setGudang] = useState<any | null>(null);
  const [gudangs, setGudangs] = React.useState<any>([]);
  const [selected, setSelecetd] = useState<any | null>(null);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");

  const getListArea = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getSyncInventory();
      setListArea(response.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const onSync = async (id: string) => {
    try {
      setDeleteConfirmation(false);
      setIsLoading(true);
      await InventoryService.putSyncInventory(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Syncronize Inventory",
        life: 3000,
      });
      getListArea();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListArea();
  }, []);

  const onGlobalFilterChange1 = () => {};

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
      </div>
    );
  };

  const header1 = renderHeader1();

  const hideDialog = () => {
    setProductDialog(false);
    setIsModify(false);
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Syncronize Inventory</h5>
          <DataTable
            value={listArea
              ?.filter((el) => !!el.nama_barang)
              .filter(
                (el) =>
                  el.nama_barang &&
                  el.nama_barang.match(new RegExp(searchValue, "i"))
              )}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={listArea.length}
            dataKey="id"
            totalRecords={listArea.length}
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
          >
            <Column
              field="nama_barang"
              header="Name"
              filterPlaceholder="Search by name"
              style={{ minWidth: "4rem", paddingTop: 8, paddingBottom: 8 }}
            />
            <Column
              field="stok"
              header="Stok"
              filterPlaceholder="Search by name"
              style={{
                minWidth: "4rem",
                textAlign: "center",
                paddingTop: 8,
                paddingBottom: 8,
              }}
            />
            <Column
              field="created_at"
              header="Warehouse Stok"
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p style={{ textAlign: "center" }}>
                  {data.barang_gudang?.reduce(
                    (accumulator: any, object: any) => {
                      return accumulator + Number(object.stok);
                    },
                    0
                  )}
                </p>
              )}
            />
            <Column
              field="created_at"
              header="Detail"
              filterPlaceholder="Search by name"
              style={{ width: 600, paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <p>
                  {data.barang_gudang
                    ?.map((a: any) => `${a.gudang}: ${a.stok}`)
                    .join(" | ")}
                </p>
              )}
            />
            {isAdmin && (
              <Column
                field="created_at"
                header="Detail"
                filterPlaceholder="Search by name"
                style={{ width: 100, paddingTop: 8, paddingBottom: 8 }}
                bodyStyle={{ textAlign: "center" }}
                body={(data: any) => (
                  <Button
                    label="Sync"
                    icon="pi pi-sync"
                    severity="secondary"
                    onClick={() => onSync(data.id_barang)}
                    className="button"
                  />
                )}
              />
            )}
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default TableDemo;
