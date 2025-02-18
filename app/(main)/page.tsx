/* eslint-disable @next/next/no-img-element */
"use client";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useRef, useState } from "react";
import ax from "../service/axios";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import Loading from "../components/atoms/loading";

import { useFormik } from "formik";
import * as Yup from "yup";
import { PayloadAddEventI } from "../interfaces/InventoryInterface";
import { Day, utils } from "react-modern-calendar-datepicker";
import { InventoryService } from "../service/InventoryService";
import { APIResponse } from "../interfaces/BaseApiResponse";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "@hassanmojab/react-modern-calendar-datepicker";
import useGetEventStatus from "../hooks/api/useGetEventStatus";
import "./DatePicker.css";

interface ISelect {
  label: string;
  value: string;
}

const Dashboard = () => {
  const toast = useRef<any>(null);
  const router = useRouter();
  const [listEvent, setListEvent] = useState<ISelect[]>([]);
  const [selectedEvent, setSelectedEvent] = useState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [productDialog, setProductDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any | null>(1);
  const [showStart, setShowStart] = useState<boolean>(false);
  const [showEnd, setShowEnd] = useState<boolean>(false);

  const formik = useFormik<PayloadAddEventI>({
    initialValues: {
      name: "",
      event_code: "",
      description: "",
      event_start: utils("en").getToday(),
      event_end: utils("en").getToday(),
      PIC: "",
      images: "",
      address: "",
      files: "",
      is_complete: 0,
      status: selectedStatus,
      notes: "",
      type: "",
      latitude: "",
      longitude: "",
      event_running: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      event_code: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      PIC: Yup.string().required("Required"),
      notes: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      const payload: any = {
        description: values.description,
        name: values.name,
        event_start: `${formik.values.event_start?.year}-${formik.values.event_start?.month}-${formik.values.event_start?.day}`,
        event_end: `${formik.values.event_end?.year}-${formik.values.event_end?.month}-${formik.values.event_end?.day}`,
        PIC: values.PIC,
        event_code: values.event_code,
        is_complete: 0,
        status: selectedStatus,
        images: values.images,
        files: values.files,
        address: values.address,
        type: "",
        latitude: "",
        longitude: "",
        event_running: "",
        notes: values.notes,
      };
      const result: APIResponse<any> = await InventoryService.addEvent(payload);
      if (result.success) {
        setTimeout(() => {
          setProductDialog(false);
        }, 200);
      }
      setIsLoading(false);
      toast?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Adding event",
        life: 3000,
      });
      getListEvent();
      onSubmit(result.data.id);
    },
  });

  const getListEvent = async () => {
    let page = 1;
    let temp: any[] = [];
    setIsLoading(true);
    do {
      const response = await fetch(`/api/event?page=${page}`);
      const res = await response.json();
      if (res.data) {
        res.data?.forEach((dt: any) => {
          temp.push({
            label: dt.name,
            value: dt.id,
          });
        });
        page++;
      } else {
        page = 0;
      }
    } while (page > 0);
    setIsLoading(false);
    setListEvent(temp);
  };

  useEffect(() => {
    getListEvent();
  }, []);

  const onSubmit = (id?: number) => {
    router.push(`/uikit/event-item?event=${id ?? selectedEvent}`);
  };

  const hideDialog = () => {
    setProductDialog(false);
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

  const onChangeStatus = (e: any) => {
    setSelectedStatus(e.target.value);
  };

  const { data: eventStatus } = useGetEventStatus({
    options: {
      enabled: true,
    },
  });

  return (
    <div className="grid" style={{ justifyContent: "center" }}>
      {isLoading && <Loading />}
      <Toast ref={toast} />
      <div className="col-12 lg:col-6 xl:col-4">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <h2 className="block text-500 mb-3">Project</h2>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-clipboard text-blue-500 text-xl" />
            </div>
          </div>
          <div className="field flex-1 flex-col">
            <label htmlFor="name">Event</label>
            <Dropdown
              onChange={(e) => setSelectedEvent(e.target.value)}
              value={selectedEvent}
              options={listEvent}
              optionLabel="label"
              placeholder="Select event"
              className="flex-1"
              style={{ width: "100%", marginBottom: 16 }}
            />
            <Button
              label="Submit"
              onClick={() => (selectedEvent ? onSubmit() : undefined)}
              style={{ width: "100%" }}
            />
            <Button
              label="New project"
              onClick={() => setProductDialog(true)}
              style={{ width: "100%", marginTop: 8 }}
              severity="info"
            />
          </div>
        </div>
        <Dialog
          visible={productDialog}
          style={{ width: "450px" }}
          header={"Add Event"}
          modal
          className="p-fluid"
          footer={productDialogFooter}
          onHide={hideDialog}
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
          <div className="field">
            <label htmlFor="name"> Event Code</label>
            <InputText
              id="name"
              value={formik.values.event_code}
              onChange={(e) =>
                formik.setFieldValue("event_code", e.target.value)
              }
              autoFocus
              className={`text-black border w-full py-2 px-4 ${
                formik.errors.event_code ? "border-red-600" : "border-gray-300"
              } rounded-lg bg-transparent`}
            />
          </div>
          <div className="field">
            <label htmlFor="name">Description</label>
            <InputText
              id="name"
              value={formik.values.description}
              onChange={(e) =>
                formik.setFieldValue("description", e.target.value)
              }
              autoFocus
              className={`text-black border w-full py-2 px-4 ${
                formik.errors.description ? "border-red-600" : "border-gray-300"
              } rounded-lg bg-transparent`}
            />
          </div>
          <div className="field">
            <label htmlFor="name"> Event Start</label>
            <InputText
              id="name"
              value={`${formik.values.event_start?.year}-${formik.values.event_start?.month}-${formik.values.event_start?.day}`}
              onFocus={() => {
                setShowEnd(false);
                setShowStart(true);
              }}
              className={`text-black border w-full py-2 px-4 ${
                formik.errors.event_start ? "border-red-600" : "border-gray-300"
              } rounded-lg bg-transparent`}
            />
            {showStart && (
              <div className="absolute">
                <div className="relative mt-2" style={{ width: 320 }}>
                  <Calendar
                    locale={"en"}
                    value={formik.values.event_start}
                    minimumDate={utils("en").getToday()}
                    onChange={(date) => {
                      setShowStart(false);
                      formik.setFieldValue("event_start", date);
                      formik.setFieldValue("event_end", undefined);
                    }}
                    onDisabledDayError={(value) => console.log(value)}
                    colorPrimary="#AB5CFA" // added this
                    calendarClassName="custom-calendar" // and this
                    calendarTodayClassName="custom-today-day" // also this
                    shouldHighlightWeekends
                  />
                </div>
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="name"> Event End</label>
            <InputText
              id="name"
              value={
                formik.values.event_end
                  ? `${formik.values.event_end?.year}-${formik.values.event_end?.month}-${formik.values.event_end?.day}`
                  : ""
              }
              onFocus={() => {
                setShowEnd(true);
                setShowStart(false);
              }}
              className={`text-black border w-full py-2 px-4 ${
                formik.errors.event_end ? "border-red-600" : "border-gray-300"
              } rounded-lg bg-transparent`}
            />
            {showEnd && (
              <div className="absolute">
                <div className="relative mt-2" style={{ width: 320 }}>
                  <Calendar
                    locale={"en"}
                    value={formik.values.event_end}
                    minimumDate={formik.values.event_start as Day}
                    onChange={(date) => {
                      setShowEnd(false);
                      formik.setFieldValue("event_end", date);
                    }}
                    onDisabledDayError={(value) => console.log(value)}
                    colorPrimary="#AB5CFA" // added this
                    calendarClassName="custom-calendar" // and this
                    calendarTodayClassName="custom-today-day" // also this
                  />
                </div>
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="name">PIC</label>
            <InputText
              id="name"
              value={formik.values.PIC as string}
              onChange={(e) => formik.setFieldValue("PIC", e.target.value)}
              autoFocus
              className={`text-black border w-full py-2 px-4 ${
                formik.errors.PIC ? "border-red-600" : "border-gray-300"
              } rounded-lg bg-transparent`}
            />
          </div>
          <div className="field">
            <label htmlFor="name">Address</label>
            <InputText
              id="name"
              value={formik.values.address}
              onChange={(e) => formik.setFieldValue("address", e.target.value)}
              autoFocus
              className={`text-black border w-full py-2 px-4 ${
                formik.errors.address ? "border-red-600" : "border-gray-300"
              } rounded-lg bg-transparent`}
            />
          </div>
          <div className="field">
            <label htmlFor="name">Status</label>
            <Dropdown
              onChange={onChangeStatus}
              value={selectedStatus}
              options={eventStatus?.data?.map?.((el: any) => {
                return {
                  label: el.name,
                  value: el.id,
                };
              })}
              optionLabel="label"
              placeholder="Select status"
              className="flex-1"
              // style={{ width: "100%" }}
            />
          </div>
          <div className="field">
            <label htmlFor="notes">Note</label>
            <InputText
              id="notes"
              value={formik.values.notes}
              onChange={(e) => formik.setFieldValue("notes", e.target.value)}
              autoFocus
              className={`text-black border w-full py-2 px-4 ${
                formik.errors.notes ? "border-red-600" : "border-gray-300"
              } rounded-lg bg-transparent`}
            />
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
