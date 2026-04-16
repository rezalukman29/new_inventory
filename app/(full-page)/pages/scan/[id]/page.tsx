"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { useParams } from "next/navigation";
import useGetEventItemDetail, {
  getEventItemDetail,
} from "@/app/hooks/api/useGetEventItemDetail";
import { isValidUrl, noImage } from "@/app/util/function";
import { Icon } from "@iconify/react";
import { Text } from "@/app/components/atoms/Text";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { getAreaList } from "@/app/hooks/api/useGetAreaList";
import moment from "moment";
import { InventoryService } from "@/app/service/InventoryService";
import { Toast } from "primereact/toast";
import Loading from "@/app/components/atoms/loading";

const ScanPage = () => {
  const params = useParams();
  const [barang, setBarang] = useState<any>(null);
  const [areas, setAreas] = useState<any>();
  const toast = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const { isFetching: isFetchingPrint, refetch: refetchEventItemPrint } =
  //   useGetEventItemDetail({
  //     params: {
  //       event_id: 9,
  //       barang_id: 149,
  //     },
  //     options: {
  //       enabled: false,
  //       onSuccess: async ({ data }) => {},
  //       onError: (error) => {},
  //     },
  //   });

  const fetchItemEvent = async () => {
    try {
      setIsLoading(true);
      const response = await getEventItemDetail({
        params: { event_id: Number(event_id), barang_id: Number(barang_id) },
      });
      setBarang(response.data);
      if (response.data.id === 0) {
        toast?.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Item not valid",
          life: 3000,
        });
        setBarang(null)
      }
      setIsLoading(false);
    } catch (error: any) {
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Item not valid",
        life: 3000,
      });
      setIsLoading(false);
      setBarang(null);
    }
  };

  const event_id = useMemo(() => {
    return params?.id?.split("-")[0];
  }, [params.id]);

  const barang_id = useMemo(() => {
    return params?.id?.split("-")[1];
  }, [params.id]);

  const fetchArea = async () => {
    try {
      const response = await getAreaList();
      setAreas(response.data);
    } catch (error: any) {}
  };

  useEffect(() => {
    if (event_id && barang_id) {
      fetchItemEvent();
      fetchArea();
    }
  }, [params?.id]);

  const onScan = async () => {
    try {
      setIsLoading(true);
      await InventoryService.putScan({
        id: barang.id,
        type: barang.scan_in === 0 ? "IN" : "OUT",
      });
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: barang.scan_in === 0 ? "Scan In" : "Scan Out",
        life: 3000,
      });
      setIsLoading(false);
      fetchItemEvent();
    } catch (error: any) {
      setIsLoading(false);
    }
  };
console.log(areas)
  const RenderItem = (item: any) => {
    return (
      <div className="col-12 lg:col-4" style={{ alignSelf: "center" }}>
        <div className="card m-3 border-1 surface-border">
          <div className="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
            <div className="flex align-items-center">
              <i className="pi pi-tag mr-2" />
              <span className="font-semibold">
                {item?.gudang?.length
                  ? item?.gudang[0]?.nama +
                    " | " +
                    item.gudang[0]?.stock +
                    " pcs"
                  : (areas?.data?.find((el: any) => el.id === item.list_id)
                      ?.name as string)}
              </span>
            </div>
            <span className={`product-badge status-instock`}>
              {item.list_id
                ? areas?.data?.find((el: any) => el.id === item.list_id)?.name
                : "No Area"}
            </span>
          </div>
          <div className="flex flex-column align-items-center text-center mb-3 mt-3">
            <img
              src={
                isValidUrl(item.photo)
                  ? item.photo
                  : item.photo
                  ? `https://democreation.site/home/public/${item.photo}`
                  : noImage
              }
              alt={item.name}
              style={{
                width: 200,
                height: 200,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <div className="text mt-2 font-bold">{item.nama_barang}</div>
            <div className="flex flex-row items-center mt-1">
              <Icon icon="vaadin:area-select" color="#000" className="mr-2" />
              <Text
                label={
                  item?.sub_list_name ? item?.sub_list_name : "No Sub Area"
                }
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
                <Checkbox checked={Boolean(item.is_checking.Valid)} disabled>
                  Checking
                </Checkbox>
                <p className="ml-2"> Checking</p>
              </div>
              <div className="flex flex-row ml-4">
                <Checkbox
                  checked={Boolean(item.is_ware_house_item.Valid)}
                  disabled
                >
                  Warehouse Item
                </Checkbox>
                <p className="ml-2"> Warehouse Item</p>
              </div>
            </div>
          </div>
          <div className="flex-row flex text-center">
            <div className="flex-1">
              <p style={{ marginBottom: 0 }}>Scan In</p>
              <Icon
                icon={
                  item?.scan_in === 1
                    ? "mingcute:check-fill"
                    : "ic:baseline-close"
                }
                color={item?.scan_in === 1 ? "green" : "red"}
                style={{ fontSize: 24 }}
              />
              <p style={{ marginTop: 8 }}> Scan In Date</p>
              <p style={{ marginTop: -8, color: "grey" }}>
                {item?.scan_in === 1
                  ? moment(item.scan_in_date.Time as any)
                      .add(
                        Number(
                          barang.scan_in_date.Time.split("+")
                            .reverse()[0]
                            .split(":")[0]
                        ),
                        "hours"
                      )
                      .format("LLL")
                  : "-"}
              </p>
            </div>
            <div className="flex-1">
              <p style={{ marginBottom: 0 }}>Scan Out</p>
              <Icon
                icon={
                  item?.scan_out === 1
                    ? "mingcute:check-fill"
                    : "ic:baseline-close"
                }
                color={item?.scan_out === 1 ? "green" : "red"}
                style={{ fontSize: 24, bottom: 18 }}
              />
              <p style={{ marginTop: 8 }}> Scan Out Date</p>
              <p style={{ marginTop: -8, color: "grey" }}>
                {item?.scan_out === 1
                  ? moment(item.scan_out_date.Time as any) .add(
                    Number(
                      barang.scan_out_date.Time.split("+")
                        .reverse()[0]
                        .split(":")[0]
                    ),
                    "hours"
                  ).format("LLL")
                  : "-"}
              </p>
            </div>
          </div>
          {barang ? (
            <Button
              severity={item.scan_in === 0 ? "success" : "info"}
              label={
                item.scan_in === 1 && item.scan_out === 1
                  ? "Scan Completed"
                  : item.scan_in === 0
                  ? "Scan In"
                  : "Scan Out"
              }
              style={{ marginTop: 32, width: "100%" }}
              disabled={item.scan_in === 1 && item.scan_out === 1}
              onClick={onScan}
            />
          ) : null}
          {/* <div className="flex align-items-center justify-content-between">
            <span className="text-2xl font-semibold"></span>
            <div className="flex-row">
              <Button
                icon="pi pi-qrcode"
                severity="secondary"
                onClick={() => undefined}
              />
              <Button
                icon="pi pi-trash"
                style={{ marginLeft: 8 }}
                onClick={() => undefined}
              />
            </div>
          </div> */}
        </div>
      </div>
    );
  };
  return (
    <>
      <Toast ref={toast} />
      {isLoading && <Loading />}
      <div
        className="grid"
        style={{
          flex: 1,
          marginTop: 32,
          marginLeft: 12,
          marginRight: 12,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!!barang ? RenderItem(barang) : <p style={{marginTop: 120, fontSize: 20}}>Url not valid</p>}
      </div>
    </>
  );
};

export default ScanPage;
