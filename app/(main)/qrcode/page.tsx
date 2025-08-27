"use client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { InventoryService } from "@/app/service/InventoryService";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import moment from "moment";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import { Dialog } from "primereact/dialog";
import useGetLogActivity, {
  getLogActivity,
} from "@/app/hooks/api/useGetLogActivity";
import useGetEmiUser from "@/app/hooks/api/useGetEmiUser";
import { Dropdown } from "primereact/dropdown";
import { SortType } from "@/app/interfaces/interfaces";
import Loading from "@/app/components/atoms/loading";
import { isValidUrl, noImage } from "@/app/util/function";
import { ISelect } from "../inventory/page";
import { DataView } from "primereact/dataview";
import { useQRCode } from "next-qrcode";
import { WEB_URL } from "@/app/util/config";
import useGetEventItem from "@/app/hooks/api/useGetEventItem";
import { Icon } from "@iconify/react";
import { Text } from "@/app/components/atoms/Text";
import { Checkbox } from "primereact/checkbox";

const TableDemo = () => {
  const { Canvas } = useQRCode();
  const toast = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listEvent, setListEvent] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [height] = useDeviceSize();
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<SortType>("ASC");
  const [sortBy, setSortBy] = useState<string>("name");
  const [first, setFirst] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(9);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [gudang, setGudang] = useState<any | null>(null);
  const [gudangs, setGudangs] = React.useState<any>([]);
  const [selected, setSelecetd] = useState<any | null>(null);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [listBarang, setListBarang] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [areaList, setAreaList] = useState<any | null>(null);
  const [eventItemData, setItemEventData] = useState<any[]>([]);
  const [listSubArea, setListSubArea] = useState<any[]>([]);
  const [listArea, setListArea] = useState<any[]>([]);
  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [loadingGet, setLoadingGet] = useState(false);
  const [cartDialog, setCartDialog] = useState(false);
  const [listCategory, setListCategory] = useState<ISelect[]>([]);
  const [width] = useDeviceSize();

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

  const handleFetch = async () => {
    setLoadingGet(true);
    let eventDetail: any = await fetch(`/api/event?eventId=${selectedEvent}`);
    eventDetail = await eventDetail.json();
    setEventDetail(eventDetail.data);
    setLoadingGet(false);
  };

  const getAreaList = async () => {
    if (selectedEvent) {
      try {
        let listArea: any = await InventoryService.getListAreaByEvent(
          Number(selectedEvent) as any
        );
        console.log("listt :", listArea);
        const listingArea = listArea?.map((item: any) => {
          return {
            label: item.area_name,
            value: item.area_id.toString(),
          };
        });
        setAreaList(listingArea);
      } catch (error: any) {
        setAreaList([]);
      }
    }
  };

  const { data: users } = useGetEmiUser({
    options: {
      enabled: true,
    },
  });

  const getLogs = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await getLogActivity({
        page,
        limit: size ?? pageSize,
        module: "",
      });
      setLogs(response.data.data);
      setTotal(response.data.total_records);
      setTotalPages(response.data.total_pages);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const isGroup = useMemo(() => {
    if (eventDetail?.scan_type === "INDIVIDUAL" || !eventDetail) {
      return false;
    } else {
      return true;
    }
  }, [eventDetail]);

  useEffect(() => {
    getLogs();
  }, [page]);

  useEffect(() => {
    if (selectedEvent) {
      getAreaList();
    }
  }, [selectedEvent]);

  const onGlobalFilterChange1 = () => {};

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
      </div>
    );
  };

  const header1 = renderHeader1();

  const { isFetching: isFetching, refetch: refetchEventItem } = useGetEventItem(
    {
      params: {
        event_id: Number(selectedEvent),
        order: "asc",
        list_id: Number(selectedArea),
      },
      options: {
        enabled: false,
        onSuccess: ({ data }) => {
          setItemEventData(data);
        },
        onError: (error) => {
          const errMessage: any = error;
          if (errMessage.response.data.message === "data not found") {
            setItemEventData([]);
          }
        },
      },
    }
  );

  const getListEvent = async (size?: number) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.getEvent({
        page,
        limit: size ?? pageSize,
        search: searchValue,
        sort,
        sortBy,
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
  console.log(selected);
  const getListSubArea = async () => {
    try {
      const response = await InventoryService.getSubArea({
        sort: "ASC",
        sortBy: "sub_area_name",
      });
      setListSubArea(response.data);
    } catch (error: any) {}
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

  useEffect(() => {
    if (selectedMenu === "BARANG") {
      getInventoryList();
    } else {
      getListEvent();
      getListArea();
      getListSubArea();
    }
  }, [page, sort, sortBy, selectedMenu]);

  useEffect(() => {
    getItemCategory();
  }, []);

  const onSort = (field: string) => {
    setSortBy(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const itemTemplate = (
    data: any,
    layout: "grid" | "list" | (string & Record<string, unknown>)
  ) => {
    if (!data) {
      return;
    }

    return dataviewGridItem(data, false);
  };

  const itemTemplateEvent = (
    data: any,
    layout: "grid" | "list" | (string & Record<string, unknown>)
  ) => {
    if (!data) {
      return;
    }

    return dataviewGridItemEvent(data, false);
  };

  const cartFooter = (
    <>
      <Button
        label="Close"
        icon="pi pi-times"
        text
        onClick={() => {
          setCartDialog(false);
          setSelecetd(null);
        }}
      />
    </>
  );

  const dataviewGridItemEvent = (item: any, isCart: boolean) => {
    const area = listArea.find((el) => el.id === item.list_id)?.name;
    return (
      <div className="col-12 lg:col-4">
        <div className="card m-2 border-1 surface-border p-5">
          <div className="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
            <div className="flex align-items-center">
              <i className="pi pi-tag mr-2" />
              <span className="font-semibold">
                {item.gudang?.length
                  ? item.gudang[0]?.nama +
                    " | " +
                    item.gudang[0]?.stock +
                    " pcs"
                  : (item.area as string)}
              </span>
            </div>
            <span className={`product-badge status-instock`}>
              {area ? area : "No Area"}
            </span>
          </div>
          <div className="flex flex-column align-items-center text-center mb-3 mt-3">
            {isGroup ? (
              <Canvas
                text={`${WEB_URL}/pages/scan/${selectedEvent}-${item.barang_id}`}
                options={{
                  errorCorrectionLevel: "M",
                  margin: 3,
                  scale: 4,
                  width: 200,
                  color: {
                    dark: "#000",
                    light: "#FFBF60FF",
                  },
                }}
              />
            ) : (
              <img
                onClick={() => {
                  setCartDialog(true);
                  setSelecetd(item);
                }}
                src={
                  "https://i.ibb.co.com/KxY93HYH/d731b458-fc52-47c3-bc0e-70a58c2ae871-1.png"
                }
                style={{ width: 200, height: 200, cursor: "pointer" }}
              />
            )}
            <div className="text mt-2 font-bold">{item.nama_barang}</div>
            <div className="text mt-1">Qty: {item.qty}</div>
            <div className="flex flex-row items-center mt-1">
              <Icon icon="vaadin:area-select" color="#000" className="mr-2" />
              <Text
                label={item?.subArea ? item?.subArea : "No Sub Area"}
                color="gray"
              />
            </div>
            {item.status && (
              <div className="flex flex-rxow items-center mt-1">
                <Icon
                  icon="material-symbols-light:task-outline-sharp"
                  color="#000"
                  className="mr-2"
                />
                <Text label={item.status} color="gray" />
              </div>
            )}
            {item?.additionalCode && (
              <div className="flex flex-row items-center mt-1">
                <Icon
                  icon="material-symbols-light:code"
                  color="#000"
                  className="mr-2"
                />
                <Text label={item.additionalCode} color="gray" />
              </div>
            )}
            {item?.notes && (
              <div className="flex flex-row items-start mt-1 ">
                <Icon
                  icon="fluent-mdl2:edit-note"
                  color="#000"
                  className="mr-2"
                />
                <Text label={item.notes} color="gray" className="break-all" />
              </div>
            )}
            <div className="mt-3 flex flex-col gap-x-4">
              <div className="flex flex-row">
                <Checkbox checked={Boolean(item.isChecking)} disabled>
                  Checking
                </Checkbox>
                <p className="ml-2"> Checking</p>
              </div>
              <div className="flex flex-row ml-4">
                <Checkbox checked={Boolean(item.isWarehouseItem)} disabled>
                  Warehouse Item
                </Checkbox>
                <p className="ml-2"> Warehouse Item</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const dataviewGridItem = (item: any, isCart: boolean) => {
    return (
      <div className="col-12 lg:col-4">
        <div className="card m-2 border-1 surface-border p-5">
          <div className="flex flex-column align-items-center text-center mb-3 mt-3">
            {selected && !isGroup ? (
              <>
                <Canvas
                  text={`${WEB_URL}/pages/scan/${selectedEvent}-${item.barang_id}-${item + 1}`}
                  options={{
                    errorCorrectionLevel: "M",
                    margin: 3,
                    scale: 4,
                    width: 200,
                    color: {
                      dark: "#000",
                      light: "#FFBF60FF",
                    },
                  }}
                />
                <div className="text mt-2 font-bold">{selected.nama}</div>
              </>
            ) : (
              <>
                <Canvas
                  text={`${WEB_URL}/pages/scan/inventory-${item.id}`}
                  options={{
                    errorCorrectionLevel: "M",
                    margin: 3,
                    scale: 4,
                    width: 200,
                    color: {
                      dark: "#000",
                      light: "#FFBF60FF",
                    },
                  }}
                />
                <div className="text mt-2 font-bold">{item.nama}</div>
                {inventoryCategory(item)}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const inventoryImage = (item: any) => {
    return (
      <div>
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

  const itemTemplateCart = (
    data: any,
    layout: "grid" | "list" | (string & Record<string, unknown>)
  ) => {
    if (!data) {
      return;
    }

    return dataviewGridItem(data, true);
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>QR Code</h5>
          <Dropdown
            value={selectedMenu}
            onChange={(e) => {
              setSelectedMenu(e.value);
              setSelectedEvent(null);
              setSelectedArea(null);
              setPage(1);
            }}
            options={[
              { value: "BARANG", label: "QR Code Inventory" },
              { value: "EVENT", label: "QR Code Event" },
            ]}
            optionLabel="label"
            placeholder="Select Option"
            className="w-full md:w-14rem mr-4"
          />
          {isLoading || isFetching || loadingGet ? (
            <Loading />
          ) : selectedMenu === "BARANG" ? (
            <DataView
              value={listBarang}
              layout={"grid"}
              paginator
              rows={9}
              first={first}
              itemTemplate={itemTemplate}
              totalRecords={total}
              alwaysShowPaginator
              onPage={(e) => {
                // setFirst(e.first);
                setPage(Number(e.page) + 1);
              }}
            ></DataView>
          ) : selectedMenu === "EVENT" ? (
            <>
              <Dropdown
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.value)}
                options={listEvent.map((el) => {
                  return {
                    value: el.id.toString(),
                    label: el.name,
                  };
                })}
                optionLabel="label"
                placeholder="Select Event"
                className="w-full md:w-14rem mr-4"
              />
              {selectedEvent && (
                <Dropdown
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.value)}
                  options={areaList}
                  optionLabel="label"
                  placeholder="Select Area"
                  className="w-full md:w-14rem mr-4"
                />
              )}
              {selectedArea && (
                <Button
                  icon="pi pi-qrcode"
                  severity="secondary"
                  onClick={() => {
                    if (selectedEvent) {
                      handleFetch();
                    }

                    refetchEventItem();
                  }}
                  label="Print"
                />
              )}
              {eventItemData?.length ? (
                <DataView
                  value={eventItemData}
                  layout={"grid"}
                  paginator
                  rows={9}
                  first={first}
                  itemTemplate={itemTemplateEvent}
                  totalRecords={total}
                  alwaysShowPaginator
                  onPage={(e) => {
                    // setFirst(e.first);
                    setPage(Number(e.page) + 1);
                  }}
                ></DataView>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <Dialog
        visible={cartDialog}
        style={{ width: width * 0.7 }}
        header={"Qr Code"}
        modal
        className="p-fluid"
        footer={cartFooter}
        onHide={() => setCartDialog(false)}
      >
        {selected?.qty > 0 ? (
          <section style={{ gridColumn: 1 }}>
            <DataView
              value={Array.from(Array(selected.qty + 1).keys())}
              layout={"grid"}
              paginator
              rows={6}
              itemTemplate={itemTemplateCart}
            ></DataView>
          </section>
        ) : (
          <div className="mt-12">
            <Text
              variant="large"
              color="black"
              label={"No Data"}
              textAlign="center"
            />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default TableDemo;
