/* eslint-disable @next/next/no-img-element */
"use client";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
import ax from "../service/axios";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import Loading from "../components/atoms/loading";

interface ISelect {
  label: string;
  value: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [listEvent, setListEvent] = useState<ISelect[]>([]);
  const [selectedEvent, setSelectedEvent] = useState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const onSubmit = () => {
    router.push(`/uikit/event-item?event=${selectedEvent}`);
  };

  return (
    <div className="grid" style={{ justifyContent: "center" }}>
      {isLoading && <Loading />}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
