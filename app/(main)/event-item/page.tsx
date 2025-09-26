"use client";
import { Dropdown } from "primereact/dropdown";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useSearchParams } from "next/navigation";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import {
  ADDITIONAL_CODE,
  ADDITIONAL_WAREHOUESE,
  STATUS_EVENT,
} from "@/app/util/data";
import { InventoryService } from "@/app/service/InventoryService";
import useGetEventStatus from "@/app/hooks/api/useGetEventStatus";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useGetEventItem from "@/app/hooks/api/useGetEventItem";
import { isValidUrl, noImage } from "@/app/util/function";
import useGetEventItemPrint from "@/app/hooks/api/useGetEventItemPrint";
import useGetAreaList from "@/app/hooks/api/useGetAreaList";
import { localStorageService } from "@/app/service/localStorage";
import { Text } from "@/app/components/atoms/Text";
import { Icon } from "@iconify/react";
import { Checkbox } from "primereact/checkbox";
import FadeIn from "react-fade-in";
import { BaseResponsePagination } from "@/app/interfaces/BaseApiResponse";
import { BarangGudangI } from "@/app/interfaces/InventoryInterface";
import { formPostEventList, formPostFixListItemV2 } from "@/app/util/fetch";
import { InputText } from "primereact/inputtext";
import { ValueLabel } from "@/app/interfaces/interfaces";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { Dialog } from "primereact/dialog";
import "./event.css";
import Loading from "@/app/components/atoms/loading";
import { useQRCode } from "next-qrcode";
import { WEB_URL } from "@/app/util/config";
import moment from "moment";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmDialog } from "primereact/confirmdialog";
import * as Yup from "yup";
import { useFormik } from "formik";

type Props = {};

interface IProduct {
  code: string;
  kategori: null | string;
  nama_barang: string;
  photo: string;
  stok: number;
  satuan: string;
  id: string;
  gudang: string;
  gudangStok: number;
  status?: string;
  area?: string;
  additionalCode?: string;
  notes?: string;
  isChecking?: boolean;
  isWarehouseItem?: boolean;
  subArea?: string;
}

const Page = (props: Props) => {
  const toast = useRef<any>(null);
  const { Canvas } = useQRCode();
  const [eventId, setEventId] = useState("");
  const [width, height] = useDeviceSize();
  const [statusEventId, setStatusEventId] = useState("");
  const searchParams = useSearchParams();
  const [listProduct, setListProduct] = useState<IProduct[]>([]);
  const [imageModal, setImageModal] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [gudang, setGudang] = useState<any>([]);
  const [selectedGudang, setSelectedGudang] = useState<any>(null);
  const [barangGudang, setBarangGudang] = useState<any>([]);
  const [barang, setBarang] = useState<any>([]);
  const [selectedBarangGudang, setSelectedBarangGudang] = useState<any>(null);
  const [loadingGet, setLoadingGet] = useState(false);
  const [loadingSearchInventory, setLoadingSearchInventory] = useState(false);
  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [areaList, setAreaList] = useState<any | null>(null);
  const [selectedArea, setSelectedArea] = useState<any | null>("all");
  const [selectedStatus, setSelectedStatus] = useState<any | null>("all");
  const [selectedStatusForm, setSelectedStatusForm] = useState<any | null>(1);
  const [barangGudangPage, setBarangGudangPage] = useState<number>(1);
  const [barangGudangTotalPage, setBarangGudangTotalPage] = useState<number>(1);
  const [barangGudangTotalRecords, setBarangGudangTotalRecords] =
    useState<number>(0);
  const [barangGudangSearch, setBarangGudangSearch] = useState<string>("");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [inputBy, setInputBy] = useState("");
  const [itemCarts, setItemCarts] = useState<any[]>([]);
  const [eventItemData, setItemEventData] = useState<any[]>([]);
  const [base64, setBase64] = useState<any[]>([]);
  const [base64Add, setBase64Add] = useState<string>();
  const [selectedAdditionalCode, setSelectedAdditionalCode] = useState<
    any | null
  >("all");
  const reportTemplateRef = useRef<any>(null);
  const [checkedItem, setCheckedItem] = useState<Boolean[]>([false, false]);
  const [listSubArea, setListSubArea] = useState<any[]>([]);
  const [subArea, setSubArea] = useState<any | null>(null);
  const [cartDialog, setCartDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [isShowPackaging, setIsShowPackaging] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [checkoutConfirmation, setCheckoutConfirmation] =
    useState<boolean>(false);
  const [isCancelScan, setIsCancelScan] = useState<boolean>(false);
  const [selected, setSelecetd] = useState<any | null>(null);
  const pdfHeader = `            ${eventDetail?.name} | ${
    STATUS_EVENT.find((el) => el.id === eventDetail?.status)?.status ?? ""
  }`;

  const formik = useFormik<any>({
    initialValues: {
      name: "",
      qr_type: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async () => {},
  });

  const handleProfile = async (e: any) => {
    const file = e.target.files[0];
    if (file?.size / 1024 / 1024 < 2) {
      const base64 = await convertToBase64(file);
      setBase64Add(base64 as any);
    } else {
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Image size must be of 2MB or less",
        life: 3000,
      });
    }
  };

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

  const toDataURL = (url: string) =>
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  function handleGeneratePdf(base64Data: string[]) {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
    });

    autoTable(doc, {
      html: "#table1",
      showHead: "everyPage",
      columnStyles: {
        0: { minCellHeight: 34, cellWidth: "auto" },
      },
      didDrawCell: (data) => {
        if (
          data.section === "body" &&
          data.column.index === 6 &&
          data.row.index > 0
        ) {
          const base64Img = base64Data[data.row.index - 1];
          if (base64Img) {
            doc.addImage(
              base64Img,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              28,
              28
            );
          }
        }
      },
    });
    doc.setPage(1);
    doc.text(pdfHeader, 10, 18);
    doc.save(`${eventDetail.name}.pdf`);
  }

  const handleScroll = useCallback(
    (e: any) => {
      // console.log("scroll :", e.target.scrollHeight, e.target.scrollTop,e.target.scrollHeight- e.target.scrollTop, e.target.clientHeight + 200, e.target.clientHeight)
      const bottom =
        e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
      // if (bottom) {
      //   setBarangGudangPage(barangGudangPage + 1);
      // }
    },
    [barangGudangPage]
  );

  const onChangeArea = (e: any) => {
    setSelectedArea(e.target.value);
    setSubArea(null);
  };
  const onChangeStatus = (e: any) => {
    setSelectedStatus(e.target.value);
  };
  const onChangeSubArea = (e: any) => {
    setSubArea(e.target.value);
  };
  const onChangeStatusForm = (e: any) => {
    setSelectedStatusForm(e.target.value);
  };
  const getListSubArea = async () => {
    try {
      const response = await InventoryService.getSubArea({
        sort: "ASC",
        sortBy: "sub_area_name",
      });
      setListSubArea(response.data);
    } catch (error: any) {}
  };

  const { data: eventStatus, refetch: refetchEventStatus } = useGetEventStatus({
    options: {
      enabled: true,
    },
  });

  const listEventStatus: ValueLabel[] = eventStatus?.data?.length
    ? eventStatus?.data.map?.((el: any) => {
        return {
          label: el.name,
          value: el.id,
        };
      })
    : [];

  const { isFetching: isFetching, refetch: refetchEventItem } = useGetEventItem(
    {
      params: {
        event_id: Number(eventId),
        order: "asc",
        ...(selectedArea !== "all" && { list_id: selectedArea }),
        ...(selectedStatus !== "all" && { status_event_id: selectedStatus }),
      },
      options: {
        enabled: !!eventId,
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

  const convertBase64 = async (arr: any) => {
    try {
      const finalData: any = [];
      const mappingBase64 = new Promise<void>((resolve) => {
        arr
          // .sort(function (a: any, b: any) {
          //   if (a.area_name > b.area_name) return 1;
          //   if (a.area_name < b.area_name) return -1;
          //   return 0;
          // })
          .forEach(async (item: any, index: number) => {
            const base64: any = await toDataURL(
              isValidUrl(item.photo) &&
                item.photo.includes("http://66.42.48.163:9000")
                ? item?.photo?.replace(
                    "http://66.42.48.163:9000/booqable/",
                    "https://storage-booqable.emi-project.my.id/booqable/"
                  )
                : item.photo
                ? `https://democreation.site/home/public/${item.photo}`
                : noImage
            );
            finalData.push({ ...item, base64: base64 });
            if (finalData.length == arr.length) resolve();
          });
      });
      await Promise.all([mappingBase64]); //.then((response) => { });
      return Promise.resolve(finalData);
    } catch (error: any) {}
  };

  const { isFetching: isFetchingPrint, refetch: refetchEventItemPrint } =
    useGetEventItemPrint({
      params: {
        event_id: Number(eventId),
        order: "asc",
        ...(selectedArea !== "all" && { list_id: selectedArea }),
        ...(selectedStatus !== "all" && { status_event_id: selectedStatus }),
      },
      options: {
        enabled: false,
        onSuccess: async ({ data }) => {
          setLoadingGet(true);
          const items = await convertBase64(data);
          setBase64(items?.map((el: any) => el?.base64));
          setItemEventData(items);
          setLoadingGet(false);
          setTimeout(() => {
            handleGeneratePdf(items?.map((el: any) => el?.base64));
          }, 200);
        },
        onError: (error) => {
          const errMessage: any = error;
          if (errMessage.response.data.message === "data not found") {
            setItemEventData([]);
          }
        },
      },
    });

  const { data: areas } = useGetAreaList({
    options: {
      enabled: !!eventId,
    },
  });

  const onOpenModalImage = (image: string) => {
    setImageModal(image);
    setImageDialog(true);
  };

  const handleFetch = async (eventId: string, selected?: string) => {
    setLoadingGet(true);
    let eventDetail: any = await fetch(`/api/event?eventId=${eventId}`);
    eventDetail = await eventDetail.json();
    setEventDetail(eventDetail.data);
    let gudang: any = await InventoryService.getGudang();
    setGudang(gudang.data);
    if (eventDetail.data) {
      try {
        let listArea: any = await InventoryService.getListAreaByEvent(eventId);
        const listingArea = listArea?.data?.map((item: any) => {
          return {
            label: item.area_name,
            value: item.area_id,
          };
        });
        setAreaList([...[{ value: "all", label: "All Area" }], ...listingArea]);
      } catch (error: any) {
        setAreaList([{ value: "all", label: "All Area" }]);
        setLoadingGet(false);
      }
    }
    setLoadingGet(false);
  };

  const isShowScan =
    eventStatus?.data?.find((el) => el.id === eventDetail?.status)
      ?.is_show_scan_result === 1
      ? true
      : false;

  useEffect(() => {
    // getListProduct()
    let event: any = searchParams.get("event");
    if (event) {
      setEventId(event);
    } else {
      setErrMsg("Event tidak boleh kosong");
      return;
    }
    refetchEventStatus();
    handleFetch(event);
    getListSubArea();
  }, [searchParams]);

  const checkCartStorage = () => {
    const carts = localStorageService.getCart("cart");
    if (carts && JSON.parse(carts)?.length) {
      setItemCarts(JSON.parse(carts));
    }
  };

  useEffect(() => {
    const unsubscribe = checkCartStorage();
    return unsubscribe;
  }, []);

  const handleDeleteCart = (id: string) => {
    setItemCarts(itemCarts?.filter((el) => el?.barang_gudang_id !== id));
    localStorageService.setCart({
      key: "cart",
      value: JSON.stringify(
        itemCarts?.filter((el) => el?.barang_gudang_id !== id)
      ),
    });
  };
  const handleDeleteFixItem = async (id: string) => {
    try {
      setDeleteConfirmation(false);
      setLoadingGet(true);
      await InventoryService.deleteFixItem(id);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Delete item",
        life: 3000,
      });
      refetchEventItem();
      setLoadingGet(false);
    } catch (error: any) {
      setLoadingGet(false);
    }
  };
  const Card = memo(({ item, isCart }: { item: IProduct; isCart: boolean }) => {
    return (
      <div onClick={() => undefined} style={{ backgroundColor: "red" }}>
        <img
          src={
            isValidUrl(item.photo)
              ? item.photo
              : item.photo
              ? `https://democreation.site/home/public/${item.photo}`
              : noImage
          }
          alt={item.nama_barang}
          className="aspect-[3/3] w-full rounded-md object-cover md:h-[300px] md:w-auto"
        />
        <div>
          <Text
            label={item.nama_barang}
            fontWeight="semi-bold"
            className="mt-2"
            color="primary"
          />
          <div className="flex flex-row items-center mt-1">
            <Icon icon="carbon:location" color="#000" className="mr-2" />
            <Text
              label={
                item.gudang
                  ? item.gudang + " | " + item.gudangStok + " pcs"
                  : (item.area as string)
              }
              color="gray"
            />
          </div>
          <div className="flex flex-row items-center mt-1">
            <Icon
              icon="fluent:slide-search-28-regular"
              color="#000"
              className="mr-2"
            />
            <Text label={item.area ?? ""} color="gray" />
          </div>
          <div className="flex flex-row items-center mt-1">
            <Icon icon="vaadin:area-select" color="#000" className="mr-2" />
            <Text label={item?.subArea ?? ""} color="gray" />
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
            <Checkbox checked={Boolean(item.isChecking)} disabled>
              Checking
            </Checkbox>
            <Checkbox checked={Boolean(item.isWarehouseItem)} disabled>
              Warehouse Item
            </Checkbox>
          </div>
          <div className="flex flex-row justify-between items-center">
            <Text
              variant="base"
              fontWeight="semi-bold"
              label={item.stok + " pcs"}
              color="active"
              className="mt-2"
            />
            <Icon
              icon="entypo:trash"
              fontSize={24}
              color="#000"
              onClick={() => {
                if (isCart) {
                  handleDeleteCart(item.id);
                } else {
                  setDeleteConfirmation(true);
                  setSelecetd(item);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  });

  const productList = useMemo(
    () =>
      eventItemData
        ?.map((dt) => {
          return {
            nama_barang: dt.nama_barang,
            code: dt.code,
            photo: dt.photo,
            satuan: dt.satuan,
            kategori: dt.kategori,
            stok: dt.qty,
            scan_in: dt.scan_in,
            scan_out: dt.scan_out,
            scan_in_date: dt.scan_in_date.Time,
            scan_out_date: dt.scan_out_date.Time,
            id: dt.id,
            barang_id: dt.barang_id,
            subArea: dt.sub_list_name,
            gudang: dt.gudang?.length ? dt.gudang[0]?.nama : "",
            gudangStok: dt.gudang?.length ? dt.gudang[0]?.stock : "",
            area: areas?.data.find((item: any) => item.id === dt.list_id)?.name,
            additionalCode: dt.AdditionalCode,
            notes: dt.notes,
            isChecking: dt.is_checking.Valid,
            isWarehouseItem: dt.is_ware_house_item.Valid,
            inputBy: dt.input_by,
          };
        })
        .filter((item: any) =>
          item.nama_barang.match(new RegExp(searchValue, "i"))
        )
        .reduce((acc: any, e: any) => {
          const found: any = acc.find(
            (x: any) =>
              e.nama_barang === x.nama_barang &&
              e.area === x.area &&
              e.subArea === x.subArea &&
              e.notes === x.notes &&
              e.additionalCode === x.additionalCode
          );
          found ? (found.stok += e.stok) : acc.push(e);
          return acc;
        }, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventItemData, searchValue, areas]
  );

  const RenderItemsCart = useMemo(
    () =>
      itemCarts?.map((dt) => {
        return {
          nama_barang: dt.detail.nama_barang,
          code: dt.detail.code,
          photo: dt.detail.photo,
          satuan: dt.detail.satuan,
          kategori: dt.detail.kategori,
          stok: dt.qty,
          id: dt.detail.barang_gudang_id,
          gudang: dt.detail.nama_gudang,
          gudangStok: dt.detail.stok_gudang,
          status: listEventStatus?.find(
            (el: any) => el.value === dt.event_status_id
          )?.label,
          area: areas?.data.find((el: any) => el.id === dt.list_id)?.name,
          subArea:
            listSubArea?.find((el: any) => el.id === dt.sub_list_id)
              ?.sub_area_name ?? "",
          additionalCode: dt.additionalCode,
          notes: dt.notes,
          isChecking: dt.isChecking,
          isWarehouseItem: dt.isWarehouseItem,
          inputBy: dt.inputBy,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemCarts, areas]
  );

  useEffect(() => {
    fetchData();
  }, [barangGudangPage]);

  useEffect(() => {
    fetchData(true);
  }, [selectedGudang, barangGudangSearch]);

  const fetchData = async (isResetPage?: boolean) => {
    setLoadingSearchInventory(true);
    const response: BaseResponsePagination<BarangGudangI[]> =
      await InventoryService.getBarangGudang(
        selectedGudang,
        isResetPage ? 1 : barangGudangPage,
        barangGudangSearch,
        Number(eventId)
      );
    if (response.data === null) {
      setLoadingSearchInventory(false);
      isResetPage && setBarangGudang([]);
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: barangGudangPage > 1 ? "all items are displayed" : "No Data",
        life: 3000,
      });
    }
    const { data, total_pages, total_records } = response;
    setBarangGudangTotalPage(total_pages);
    setBarangGudangTotalRecords(total_records);
    const itemBaramgGudang = data.map((item: any) => {
      return {
        ...item,
        nama: item.nama_barang,
      };
    });
    setBarangGudang(
      barangGudangPage === 1 || isResetPage
        ? itemBaramgGudang
        : [...barangGudang, ...itemBaramgGudang]
    );
    setLoadingSearchInventory(false);
  };

  const onAddCart = () => {
    if (
      selectedArea === "all" ||
      !subArea ||
      selectedAdditionalCode === "all" ||
      !selectedBarangGudang ||
      !qty ||
      selectedStatusForm === "all"
    ) {
      return toast?.current?.show({
        severity: "error",
        summary: "Complete the form",
        detail: "Failed to add, Complete the form",
        life: 3000,
      });
    }
    const carts = [
      ...itemCarts,
      ...[
        {
          list_id: Number(selectedArea),
          sub_list_id: !!subArea ? Number(subArea) : null,
          event_id: Number(eventId),
          barang_gudang_id: selectedBarangGudang.barang_gudang_id,
          qty: parseInt(qty),
          scan_in: 1,
          scan_out: 1,
          notes,
          inputBy,
          event_status_id: Number(selectedStatusForm),
          detail: {
            ...selectedBarangGudang,
            nama_gudang: selectedBarangGudang.gudang.gudang_name,
          },
          additionalCode: selectedAdditionalCode,
          isChecking: checkedItem[0],
          isWarehouseItem: checkedItem[1],
        },
      ],
    ];
    localStorageService.setCart({ key: "cart", value: JSON.stringify(carts) });
    setItemCarts(carts);
    setSelectedArea("all");
    setSelectedStatusForm(1);
    setSubArea(null);
    setSelectedAdditionalCode("all");
    setCheckedItem([false, false]);
    setSelectedBarangGudang(null);
    setQty("");
    setNotes("");
    setInputBy("");
    toast?.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Adding item to cart",
      life: 3000,
    });
  };

  const onSubmit = async () => {
    try {
      if (
        selectedArea === "all" ||
        !selectedGudang ||
        !selectedBarangGudang ||
        !qty ||
        selectedStatus === "all"
      ) {
        toast?.current?.show({
          severity: "error",
          summary: "Complete the form",
          detail: "Insert has been failed, ",
          life: 3000,
        });
      } else {
        setLoadingGet(true);
        let eventListResponse: any = await formPostEventList({
          list_id: Number(selectedArea),
          event_id: Number(eventId),
        });
        let eventListId = eventListResponse.id;

        const item: any = {
          fix_event_list_id: eventListId,
          barang_gudang_id: selectedBarangGudang.barang_gudang_id,
          qty: parseInt(qty),
          scan_in: 0,
          scan_out: 0,
          notes: "",
          event_status_id: Number(selectedStatus),
          detail: {
            ...selectedBarangGudang,
            nama_gudang: selectedGudang.nama,
          },
        };

        await formPostFixListItemV2(item);
        setLoadingGet(false);

        setQty("");
        setProductDialog(false);
        toast?.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Add item has been successfully",
          life: 3000,
        });
        refetchEventItem();
      }
    } catch (error: any) {
      setLoadingGet(false);
    }
  };

  const onInsert = async (arr: any) => {
    try {
      const response: any = [];
      const mappingInsert = new Promise<void>((resolve) => {
        arr.forEach(async (item: any, index: number) => {
          const eventListResponse: any = await formPostEventList({
            list_id: item.list_id,
            event_id: item.event_id,
            ...(item.sub_list_id && { sub_list_id: item.sub_list_id }),
          });
          const eventListId = eventListResponse.id;
          const payload: any = {
            fix_event_list_id: eventListId,
            barang_gudang_id: item.barang_gudang_id,
            qty: item.qty,
            scan_in: 0,
            scan_out: 0,
            notes: item?.notes,
            input_by: item.inputBy,
            event_status_id: item.event_status_id,
            additional_code: item.additionalCode,
            is_checking: item.isChecking ? 1 : 0,
            is_ware_house_item: item.isWarehouseItem ? 1 : 0,
          };
          await formPostFixListItemV2(payload);
          response.push({
            eventListId,
          });
          if (response.length == arr.length) resolve();
        });
      });
      await Promise.all([mappingInsert]); //.then((response) => { });
      return Promise.resolve(response);
    } catch (error: any) {}
  };

  const onCheckOut = async () => {
    try {
      setCartDialog(false);
      setLoadingGet(true);
      await onInsert(itemCarts);
      setItemCarts([]);
      setLoadingGet(false);
      localStorageService.clearCart("cart");
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Add item has been successfully",
        life: 3000,
      });
      fetchData(true);
    } catch (error: any) {
      setLoadingGet(false);
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Erorr insert data",
        life: 3000,
      });
    }
  };

  const pdfData = eventItemData
    ?.map((dt) => {
      return {
        nama_barang: dt.nama_barang,
        code: dt.code,
        base64: dt.base64,
        photo: dt.photo,
        satuan: dt.satuan,
        kategori: dt.kategori,
        stok: dt.qty,
        id: dt.id,
        gudang: dt.gudang?.length ? dt.gudang[0]?.nama : "",
        gudangStok: dt.gudang?.length ? dt.gudang[0]?.stock : "",
        area:
          areas?.data.find((item: any) => item.id === dt.list_id)?.name ?? "",
        subArea: dt.sub_list_name,
        additionalCode: dt.AdditionalCode,
        notes: dt.notes,
        status:
          STATUS_EVENT.find((a) => a.id === dt.event_status_id)?.status ?? "",
      };
    })
    .filter((item: any) => item.nama_barang.match(new RegExp(searchValue, "i")))
    .reduce((acc: any, e: any) => {
      const found: any = acc.find(
        (x: any) =>
          e.nama_barang === x.nama_barang &&
          e.area === x.area &&
          e.notes === x.notes &&
          e.additionalCode === x.additionalCode
      );
      found ? (found.stok += e.stok) : acc.push(e);
      return acc;
    }, []);

  const dataviewGridItem = (item: any, isCart: boolean) => {
    return (
      <div className="col-12 lg:col-4">
        <div className="card m-2 border-1 surface-border p-5">
          <div className="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
            <div className="flex align-items-center">
              <i className="pi pi-tag mr-2" />
              <span className="font-semibold">
                {item.gudang
                  ? item.gudang + " | " + item.gudangStok + " pcs"
                  : (item.area as string)}
              </span>
            </div>
            <span className={`product-badge status-instock`}>
              {item.area ? item.area : "No Area"}
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
            <div className="text mt-1">Qty: {item.stok}</div>
            <div className="flex flex-row items-center mt-1">
              <Icon
                icon="material-symbols:edit-location-alt-outline-sharp"
                color="#000"
                className="mr-2"
              />
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
            <div className="flex flex-row" style={{ alignItems: "center" }}>
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
              {item?.inputBy && (
                <div className="flex flex-row items-center mt-1 ml-2">
                  <Icon
                    icon="solar:user-bold-duotone"
                    color="#000"
                    className="mr-2"
                  />
                  <Text
                    label={item.inputBy}
                    color="gray"
                    className="break-all"
                  />
                </div>
              )}
            </div>
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
          {isShowScan ? (
            <>
              {item.scan_in === 0 || item.scan_in === 1 ? (
                <div
                  className="flex-row flex text-center"
                  style={{ marginBottom: 16 }}
                >
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
                        ? moment(item.scan_in_date as any)
                            .add(
                              Number(
                                item.scan_in_date
                                  .split("+")
                                  .reverse()[0]
                                  .split(":")[0]
                              ),
                              "hours"
                            )
                            .format("LLL")
                        : "-"}
                    </p>
                    {item?.scan_in === 1 && (
                      <Button
                        severity={"danger"}
                        label="Cancel"
                        style={{ padding: 6, fontSize: 10, top: -8 }}
                        onClick={() => {
                          setSelecetd({ ...item, type: "IN" });
                          setIsCancelScan(true);
                          setDeleteConfirmation(true);
                        }}
                      />
                    )}
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
                        ? moment(item.scan_out_date as any)
                            .add(
                              Number(
                                item.scan_out_date
                                  .split("+")
                                  .reverse()[0]
                                  .split(":")[0]
                              ),
                              "hours"
                            )
                            .format("LLL")
                        : "-"}
                    </p>
                    {item?.scan_in === 1 && (
                      <Button
                        severity={"danger"}
                        label="Cancel"
                        style={{ padding: 6, fontSize: 10, top: -8 }}
                        onClick={() => {
                          setSelecetd({ ...item, type: "OUT" });
                          setIsCancelScan(true);
                          setDeleteConfirmation(true);
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="flex align-items-center justify-content-between">
            <span className="text-2xl font-semibold"></span>
            <div className="flex-row">
              {!isCart && (
                <Button
                  icon="pi pi-qrcode"
                  severity="secondary"
                  onClick={() => {
                    setBarang(item);
                    setTimeout(() => {
                      setQrDialog(true);
                    }, 500);
                  }}
                />
              )}
              <Button
                icon="pi pi-trash"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  if (isCart) {
                    handleDeleteCart(item.id);
                  } else {
                    setSelecetd(item);
                    setDeleteConfirmation(item);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
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

  const itemTemplateCart = (
    data: any,
    layout: "grid" | "list" | (string & Record<string, unknown>)
  ) => {
    if (!data) {
      return;
    }

    return dataviewGridItem(data, true);
  };

  const isGroup = useMemo(() => {
    if (eventDetail?.scan_type === "INDIVIDUAL" || !eventDetail) {
      return false;
    } else {
      return true;
    }
  }, [eventDetail]);

  const productDialogFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        onClick={() => setProductDialog(false)}
      />
      <Button label="Save" icon="pi pi-check" onClick={onAddCart} />
    </>
  );

  const dialogPackagingFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        onClick={() => setIsShowPackaging(false)}
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={() => setIsShowPackaging(false)}
      />
    </>
  );

  const cartFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        onClick={() => {
          setCartDialog(false);
          setQrDialog(false);
        }}
      />
      {itemCarts?.length ? (
        <Button
          label="Checkout"
          icon="pi pi-check"
          text
          onClick={() => {
            setCartDialog(false);
            setCheckoutConfirmation(true);
          }}
        />
      ) : null}
    </>
  );

  const onScan = async (id: any, type: "IN" | "OUT") => {
    try {
      setDeleteConfirmation(false);
      setLoadingGet(true);
      await InventoryService.putScan({
        id: id,
        type,
      });
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: barang.scan_in === 0 ? "Scan In" : "Scan Out",
        life: 3000,
      });
      setSelecetd(null);
      setIsCancelScan(false);
      setLoadingGet(false);
      refetchEventItem();
    } catch (error: any) {
      setLoadingGet(false);
    }
  };

  const itemTemplateQR = (
    data: any,
    layout: "grid" | "list" | (string & Record<string, unknown>)
  ) => {
    if (!data) {
      return;
    }

    return dataviewGridQR(data, true);
  };

  const dataviewGridQR = (item: any, isCart: boolean) => {
    return (
      <div className="col-12 lg:col-4">
        <div className="card m-2 border-1 surface-border p-5">
          <div className="flex flex-column align-items-center text-center mb-3 mt-3">
            <>
              <Canvas
                text={`${WEB_URL}/pages/scan/${eventDetail?.id}-${
                  item.barang_id
                }-${item + 1}`}
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
            </>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={deleteConfirmation}
        onHide={() => {
          setDeleteConfirmation(false);
          setSelecetd(null);
          setIsCancelScan(false);
        }}
        message={
          isCancelScan
            ? selected?.type === "IN"
              ? `Are you sure you want to cancel Scan In ${selected?.nama_barang}?`
              : `Are you sure you want to cancel Scan Out ${selected?.nama_barang}?`
            : `Are you sure you want to delete ${selected?.nama_barang}?`
        }
        header={
          isCancelScan
            ? selected?.type === "IN"
              ? "Cancel Scan In Confirmation"
              : "Cancel Scan Out Confirmation"
            : "Delete Confirmation"
        }
        icon="pi pi-exclamation-triangle"
        accept={() =>
          isCancelScan
            ? onScan(selected.id, selected.type as any)
            : handleDeleteFixItem(selected.id)
        }
        reject={() => {
          setDeleteConfirmation(false);
          setSelecetd(null);
          setIsCancelScan(false);
        }}
      />
      <ConfirmDialog
        visible={checkoutConfirmation}
        onHide={() => {
          setCheckoutConfirmation(false);
        }}
        message={`Are you sure you want to checkout ${itemCarts?.length} item?`}
        header={"Checkout Confirmation"}
        icon="pi pi-exclamation-triangle"
        accept={onCheckOut}
        reject={() => {
          setCheckoutConfirmation(false);
        }}
      />
      {(loadingGet || isFetching || isFetchingPrint) && <Loading />}
      <table id="table1" style={{ color: "#000", display: "none" }}>
        <tr>
          <th>No</th>
          <th>Area</th>
          <th>Sub Area</th>
          <th>Code</th>
          <th>Status</th>
          <th>Item</th>
          <th>Photo</th>
          <th>Warehouse</th>
          <th>Stock needed</th>
          <th>Memo</th>
        </tr>
        {pdfData
          // .sort(function (a: any, b: any) {
          //   if (a.area > b.area) return 1;
          //   if (a.area < b.area) return -1;
          //   return 0;
          // })
          .map((item: any, idx: number) => {
            return (
              <tr>
                <td>{idx + 1}</td>
                <td>{item.area}</td>
                <td>{item.subArea}</td>
                <td>{item.additionalCode}</td>
                <td style={{ textAlign: "left", width: 70 }}>{item.status}</td>
                <td style={{ textAlign: "left", width: 150 }}>
                  {item.nama_barang}
                </td>
                <td>
                  <img src={item.base64} />
                </td>

                <td>{item.gudang}</td>
                <td style={{ textAlign: "left", width: 50 }}>
                  {item.stok + " " + item.satuan}
                </td>
                <td style={{ textAlign: "left", width: 80 }}>{item.notes}</td>
              </tr>
            );
          })}
      </table>
      <div className="col-12">
        <div className="card">
          <Text
            label={eventDetail?.name}
            color="black"
            fontWeight="bold"
            variant="large"
            textAlign="center"
          />
          <div className="flex flex-row items-center">
            <Dropdown
              onChange={onChangeStatus}
              value={selectedStatus}
              options={[
                ...[{ value: "all", label: "All Status" }],
                ...listEventStatus,
              ]}
              optionLabel="label"
              placeholder="Select status"
              className="flex-1"
              // style={{ width: "100%"}}
            />
            <div style={{ width: 8 }} />
            <Dropdown
              onChange={onChangeArea}
              value={selectedArea}
              options={areaList}
              optionLabel="label"
              placeholder="Select status"
              className="flex-1"
              // style={{ width: "100%"}}
            />
            <div style={{ width: 8 }} />
            <Button label="Check" onClick={() => refetchEventItem()} />
            <div style={{ width: 8 }} />
            <Button label="Print" onClick={() => refetchEventItemPrint()} />
          </div>
          <div className="flex justify-content-between mt-4">
            <div className="flex">
              <span className="p-input-icon-left mr-4">
                <i className="pi pi-search" />
                <InputText
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Keyword Search"
                />
              </span>
            </div>
            <div className="flex-row">
              <Button
                label={`New Packaging`}
                icon="pi pi-inbox"
                severity="warning"
                className=" mr-2"
                onClick={() => setIsShowPackaging(true)}
              />
              <Button
                label={`Cart (${itemCarts?.length})`}
                icon="pi pi-shopping-cart"
                severity="info"
                className=" mr-2"
                onClick={() => setCartDialog(true)}
              />
              <Button
                label="New"
                icon="pi pi-plus"
                severity="success"
                className=" mr-2"
                onClick={() => setProductDialog(true)}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center mt-4 justify-start pl-2">
            <div className="flex flex-row">
              <Text
                color="black"
                label={`${eventItemData?.length?.toString()} `}
                fontWeight="bold"
                className="mr-1"
              />
              <Text color="black" label={"pcs item for"} className="mr-1" />
              <Text
                color="black"
                label={`"${
                  selectedStatus === "all"
                    ? "All Status"
                    : listEventStatus?.find(
                        (el: any) => Number(el.value) === Number(selectedStatus)
                      )?.label
                }"`}
                fontWeight="bold"
                className="mr-1"
              />
            </div>
            <div className="flex flex-row">
              <Text color="black" label={"state in"} className="mr-1" />
              <Text
                color="black"
                label={`"${
                  selectedArea === "all"
                    ? "All Place"
                    : areas?.data.find(
                        (el: any) => Number(el.id) === Number(selectedArea)
                      )?.name
                }"`}
                fontWeight="bold"
                className="mr-1"
              />
              <Text color="black" label={"Area"} className="mr-1" />
            </div>
          </div>

          {eventItemData?.length ? (
            <section style={{ gridColumn: 1 }}>
              {/* {productList} */}
              <DataView
                value={productList}
                layout={"grid"}
                paginator
                rows={9}
                itemTemplate={itemTemplate}
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

          <Dialog
            visible={productDialog}
            style={{ width: width * 0.7 }}
            header={"Add Inventory"}
            modal
            className="p-fluid"
            footer={productDialogFooter}
            onHide={() => setProductDialog(false)}
          >
            <div className="flex flex-row">
              <div style={{ width: width * 0.4, marginRight: 32 }}>
                <div className="field flex-1">
                  <label htmlFor="name">Warehouse</label>
                  <Dropdown
                    onChange={(e) => setSelectedGudang(e.target.value)}
                    value={selectedGudang}
                    options={[
                      ...gudang.map((el: any) => {
                        return {
                          label: el.nama,
                          value: el.id,
                        };
                      }),
                      ...ADDITIONAL_WAREHOUESE,
                    ]}
                    optionLabel="label"
                    placeholder="Select warehouse"
                    className="flex-1"
                    // style={{ width: "100%"}}
                  />
                </div>
                {selectedGudang && (
                  <div className="field flex-1">
                    <label htmlFor="name">Inventory</label>
                    <div className="flex flex-row">
                      <span className="p-input-icon-left mr-4">
                        <i className="pi pi-search" />
                        <InputText
                          value={barangGudangSearch}
                          onChange={(e) =>
                            setBarangGudangSearch(e.target.value)
                          }
                          placeholder="Keyword Search"
                          style={{ width: 420 }}
                        />
                      </span>

                      <div
                        style={{
                          flexDirection: "row",
                          display: "flex",
                          columnGap: 4,
                          paddingBottom: 8,
                          width: "100%",
                        }}
                      >
                        <Text
                          fontWeight="bold"
                          color="black"
                          label={barangGudangTotalRecords.toString()}
                        />
                        <Text
                          fontWeight="regular"
                          color="black"
                          label="records found"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className="holagridItem"
                  onScroll={handleScroll}
                  style={{ maxHeight: height * 0.55 }}
                >
                  {selectedGudang &&
                    barangGudang.map((item: any) => (
                      <div
                        style={{
                          // width: 300,
                          flexDirection: "column",
                          backgroundColor: "transparent",
                          borderWidth: 4,
                          borderRadius: 8,
                          padding: 4,
                          borderColor:
                            selectedBarangGudang?.barang_gudang_id ===
                            item.barang_gudang_id
                              ? "#6366F1"
                              : "transparent",
                          borderStyle: "solid",
                        }}
                        className="flex  rounded-lg mb-3 cursor-pointer items-center"
                        onClick={() => {
                          setSelectedBarangGudang(item);
                          setQty("");
                        }}
                      >
                        <img
                          src={
                            isValidUrl(item.photo)
                              ? item.photo
                              : item.photo
                              ? `https://democreation.site/home/public/${item.photo}`
                              : noImage
                          }
                          alt={item.nama_barang}
                          style={{
                            width: "100%",
                            height: 240,
                            objectFit: "cover",
                            marginBottom: 8,
                            borderRadius: 4,
                          }}
                        />
                        <div className="items-start">
                          <Text
                            fontWeight="semi-bold"
                            color="black"
                            label={item.nama_barang}
                            textAlign="left"
                          />
                          <Text
                            fontWeight="regular"
                            color="black"
                            label={"Stok : " + item.stok_gudang}
                            textAlign="left"
                          />
                        </div>
                      </div>
                    ))}

                  {/* <Button
                onClick={() => setBarangGudangPage(barangGudangPage + 1)}
                style={{
                  backgroundColor: "#6366F1",
                  color: "#fff",
                  alignSelf: "center",
                  textAlign: 'center'
                }}
              >
                Load More
              </Button> */}
                </div>
                {selectedGudang && (
                  <Button
                    label={"Load More"}
                    severity="info"
                    className=" mr-2"
                    loading={loadingSearchInventory}
                    style={{
                      justifyContent: "center",
                      height: 50,
                      marginTop: 8,
                    }}
                    onClick={() => setBarangGudangPage(barangGudangPage + 1)}
                  />
                )}
              </div>
              <div style={{ width: width * 0.3 - 32 }}>
                <div className="field flex-1">
                  <label htmlFor="name">Quantity</label>
                  <InputText
                    id="name"
                    value={qty}
                    onChange={(e) => {
                      if (
                        (Number(e.target.value) > 0 &&
                          Number(e.target.value) <=
                            selectedBarangGudang.stok_gudang &&
                          !e.target.value.includes(".")) ||
                        (e.target.value === "" && !e.target.value.includes("."))
                      ) {
                        setQty(e.target.value);
                      }
                    }}
                    autoFocus
                    //   className={`text-black border w-full py-2 px-4 rounded-lg bg-transparent`}
                  />
                </div>
                <div className="field flex-1 mt-4">
                  <label htmlFor="name">Additional Code</label>
                  <Dropdown
                    onChange={(e) => setSelectedAdditionalCode(e.target.value)}
                    value={selectedAdditionalCode}
                    options={ADDITIONAL_CODE}
                    optionLabel="label"
                    placeholder="Select unit"
                    className="flex-1"
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="field flex-1 mt-4">
                  <label htmlFor="name">Select Area</label>
                  <Dropdown
                    onChange={onChangeArea}
                    value={selectedArea}
                    options={areas?.data?.map((el) => {
                      return {
                        value: el.id,
                        label: el.name,
                      };
                    })}
                    optionLabel="label"
                    placeholder="Select area"
                    className="flex-1"
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="field flex-1 mt-4">
                  <label htmlFor="name">Sub area</label>
                  <Dropdown
                    onChange={onChangeSubArea}
                    value={subArea}
                    options={listSubArea
                      ?.filter((a) => a.area_id === Number(selectedArea))
                      .map((el) => {
                        return {
                          value: el.id,
                          label: el.sub_area_name,
                        };
                      })}
                    optionLabel="label"
                    placeholder="Select sub area"
                    className="flex-1"
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="field flex-1 mt-4">
                  <label htmlFor="name">Memo</label>
                  <InputText
                    id="name"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    autoFocus
                    //   className={`text-black border w-full py-2 px-4 rounded-lg bg-transparent`}
                  />
                </div>
                <div className="field flex-1 mt-4">
                  <label htmlFor="name">Status</label>
                  <Text
                    fontWeight="regular"
                    color="black"
                    label={
                      listEventStatus?.find(
                        (el) => el.value === selectedStatusForm
                      )?.label as string
                    }
                    textAlign="left"
                    variant="base"
                  />
                </div>
                <div className="field flex-1 mt-4">
                  <div className="flex flex-row">
                    <Checkbox
                      checked={checkedItem[0] as boolean}
                      onChange={(e) =>
                        setCheckedItem([
                          e.target.checked as boolean,
                          checkedItem[1],
                        ])
                      }
                    >
                      Checking
                    </Checkbox>
                    <p className="ml-2"> Checked</p>
                  </div>
                </div>
                {!!checkedItem[0] ? (
                  <div className="mb-4">
                    <div className="field flex-1 mt-4">
                      <label htmlFor="name">Input By</label>
                      <InputText
                        id="name"
                        value={inputBy}
                        onChange={(e) => setInputBy(e.target.value)}
                        autoFocus
                        //   className={`text-black border w-full py-2 px-4 rounded-lg bg-transparent`}
                      />
                    </div>
                    <div className="field flex-1">
                      <label htmlFor="notes">Image</label>
                      {base64Add ? (
                        <div className="flex flex-row gap-x-4 items-center">
                          <img
                            src={base64Add}
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
                            onClick={() => setBase64Add("")}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-row items-center gap-x-4">
                            <input
                              type="file"
                              style={{ color: "#000" }}
                              className="form-control"
                              onChange={(e) => handleProfile(e)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
                <div className="field flex-1 mt-2">
                  <div className="flex flex-row">
                    <Checkbox
                      checked={checkedItem[1] as boolean}
                      onChange={(e) =>
                        setCheckedItem([
                          e.target.checked as boolean,
                          checkedItem[0],
                        ])
                      }
                    >
                      Warehouse Item
                    </Checkbox>
                    <p className="ml-2"> Warehouse Item</p>
                  </div>
                </div>
              </div>
            </div>
            {loadingSearchInventory && <Loading />}
          </Dialog>
          <Dialog
            visible={cartDialog}
            style={{ width: width * 0.7 }}
            header={"Cart"}
            modal
            className="p-fluid"
            footer={cartFooter}
            onHide={() => setCartDialog(false)}
          >
            {itemCarts?.length ? (
              <section style={{ gridColumn: 1 }}>
                <DataView
                  value={RenderItemsCart}
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
          <Dialog
            visible={qrDialog}
            style={{ width: !isGroup ? width * 0.7 : undefined }}
            header={"QR Code"}
            modal
            className="p-fluid"
            footer={cartFooter}
            onHide={() => setQrDialog(false)}
          >
            <div style={{ justifyContent: "center", textAlign: "center" }}>
              {isGroup ? (
                <>
                  <Canvas
                    text={`${WEB_URL}/pages/scan/${eventId}-${barang.barang_id}`}
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
                  <Text
                    variant="large"
                    color="black"
                    label={barang?.nama_barang}
                    textAlign="center"
                    className="mt-2"
                  />
                </>
              ) : barang?.stok > 0 ? (
                <section style={{ gridColumn: 1 }}>
                  <DataView
                    value={Array?.from(Array(barang?.stok + 1).keys())}
                    layout={"grid"}
                    paginator
                    rows={6}
                    itemTemplate={itemTemplateQR}
                  ></DataView>
                </section>
              ) : null}
            </div>
          </Dialog>
          <Dialog
            visible={isShowPackaging}
            style={{ width: "450px" }}
            header={"New Packaging"}
            modal
            className="p-fluid"
            footer={dialogPackagingFooter}
            onHide={() => setIsShowPackaging(false)}
          >
            <div className="field">
              <label htmlFor="name">Name</label>
              <InputText
                id="name"
                value={formik.values.name}
                onChange={(e) => formik.setFieldValue("name", e.target.value)}
                autoFocus
                className={`text-black border w-full py-2 px-4 ${
                  formik.errors.name ? "border-red-600" : "border-gray-300"
                } rounded-lg bg-transparent`}
              />
            </div>
            <div className="field flex-1">
              <label htmlFor="name">Qr Code</label>
              <Dropdown
                value={formik.values.qr_type}
                onChange={(e) => {
                  formik.setFieldValue("qr_type", e.value);
                }}
                options={[
                  { value: "BARANG", label: "QR Code Inventory" },
                  { value: "EVENT", label: "QR Code Event" },
                ]}
                optionLabel="label"
                placeholder="Select Option"
                className="w-full md:w-14rem mr-4"
              />
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Page;
