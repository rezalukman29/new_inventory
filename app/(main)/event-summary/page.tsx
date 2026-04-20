"use client";
import useGetEventStatus from "@/app/hooks/api/useGetEventStatus";
import { SortType, ValueLabel } from "@/app/interfaces/interfaces";
import { InventoryService } from "@/app/service/InventoryService";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import "../index.css";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import useGetUsers from "@/app/hooks/api/useGetUsers";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');
 
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
 
  body {
    font-family: 'DM Sans', sans-serif;
    background: #f4f5f7;
    color: #1a1a2e;
  }
 
  .dashboard {
    min-height: 100vh;
    background: #f4f5f7;
    padding: 24px;
  }
 
  /* ── Header ── */
  .header {
    background: #fff;
    border-radius: 16px;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
 
  .header-title {
    font-family: 'Inter-Medium';
    font-size: 20px;
    font-weight: 600;
    color: #1a1a2e;
    margin-right: 8px;
  }
 
  .header-meta {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    flex: 1;
  }
 
  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #6b7280;
  }
 
  .meta-item svg {
    opacity: 0.6;
  }
 
  .badge-completed {
    background: #d1fae5;
    color: #065f46;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    margin-left: auto;
  }
 
  /* ── Stat Cards ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
 
  @media (max-width: 1100px) {
    .stats-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 600px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
 
  .stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border-top: 3px solid transparent;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
 
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.09);
  }
 
  .stat-card.blue  { border-top-color: #6366f1; }
  .stat-card.green { border-top-color: #10b981; }
  .stat-card.purple{ border-top-color: #8b5cf6; }
  .stat-card.teal  { border-top-color: #06b6d4; }
  .stat-card.red   { border-top-color: #ef4444; }
  .stat-card.orange{ border-top-color: #f97316; }
 
  .stat-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 8px;
  }
 
  .stat-value {
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 6px;
    color: #1a1a2e;
  }
 
  .stat-card.red   .stat-value { color: #ef4444; }
  .stat-card.orange .stat-value { color: #f97316; }
 
  .stat-sub {
    font-size: 12px;
    color: #9ca3af;
  }
 
  /* ── Progress Section ── */
  .progress-section {
    background: #fff;
    border-radius: 14px;
    padding: 20px 28px;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
 
  .progress-section h2 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 18px;
  }
 
  .progress-list {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
  }
 
  .progress-item {
    flex: 1;
    min-width: 200px;
  }
 
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }
 
  .progress-header strong {
    color: #1a1a2e;
  }
 
  .progress-track {
    height: 6px;
    background: #e5e7eb;
    border-radius: 99px;
    overflow: hidden;
  }
 
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s ease;
  }
 
  .fill-blue   { background: #6366f1; }
  .fill-purple { background: #8b5cf6; }
  .fill-green  { background: #10b981; }
 
  /* ── Area Grid ── */
  .areas-section h2 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 16px;
  }
 
  .areas-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 14px;
  }
 
  @media (max-width: 1200px) {
    .areas-grid { grid-template-columns: repeat(4, 1fr); }
  }
  @media (max-width: 900px) {
    .areas-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 600px) {
    .areas-grid { grid-template-columns: repeat(2, 1fr); }
  }
 
  .area-card {
    background: #fff;
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
 
  .area-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.09);
  }
 
  .area-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
 
  .area-name {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #1a1a2e;
    text-transform: uppercase;
  }
 
  .area-count {
    font-size: 11px;
    color: #9ca3af;
    white-space: nowrap;
  }
 
  .area-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
 
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
 
  .dot-blue   { background: #6366f1; }
  .dot-purple { background: #8b5cf6; }
  .dot-red { background: #059669; }
 
  .area-row-label {
    font-size: 11px;
    color: #6b7280;
    width: 50px;
    flex-shrink: 0;
  }
 
  .mini-track {
    flex: 1;
    height: 4px;
    background: #e5e7eb;
    border-radius: 99px;
    overflow: hidden;
  }
 
  .mini-fill {
    height: 100%;
    border-radius: 99px;
  }
 
  .fill-100 { width: 100%; }
  .fill-75  { width: 75%; }
  .fill-67  { width: 67%; }
  .fill-50  { width: 50%; }
  .fill-33  { width: 33%; }
  .fill-0   { width: 0%; }
 
  .area-row-pct {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    width: 32px;
    text-align: right;
  }
 
  .area-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
 
  .tag {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 99px;
  }
 
  .tag-inuse   { background: #ede9fe; color: #5b21b6; }
  .tag-ready   { background: #d1fae5; color: #065f46; }
  .tag-missing { background: #fee2e2; color: #991b1b; }
  .tag-damaged { background: #ffedd5; color: #9a3412; }
`;

const areas = [
  {
    name: "BRIDAL BACKDROP",
    count: 2,
    checked: 100,
    scanIn: 100,
    tags: [{ label: "In Use · 2", cls: "tag-inuse" }],
  },
  {
    name: "BRIDAL ROOM",
    count: 2,
    checked: 50,
    scanIn: 50,
    tags: [{ label: "Ready · 2", cls: "tag-ready" }],
  },
  {
    name: "BRIDAL TABLE",
    count: 2,
    checked: 100,
    scanIn: 100,
    tags: [{ label: "In Use · 2", cls: "tag-inuse" }],
  },
  {
    name: "CAR DECOR",
    count: 2,
    checked: 50,
    scanIn: 50,
    tags: [
      { label: "In Use · 1", cls: "tag-inuse" },
      { label: "Missing · 1", cls: "tag-missing" },
    ],
  },
  {
    name: "CEREMONY",
    count: 2,
    checked: 100,
    scanIn: 100,
    tags: [{ label: "In Use · 2", cls: "tag-inuse" }],
  },
  {
    name: "CHAMPAGNE WALL",
    count: 2,
    checked: 50,
    scanIn: 50,
    tags: [
      { label: "In Use · 1", cls: "tag-inuse" },
      { label: "Ready · 1", cls: "tag-ready" },
    ],
  },
  {
    name: "COCKTAIL",
    count: 2,
    checked: 100,
    scanIn: 100,
    tags: [{ label: "In Use · 2", cls: "tag-inuse" }],
  },
  {
    name: "ENTRANCE",
    count: 3,
    checked: 67,
    scanIn: 100,
    tags: [
      { label: "In Use · 2", cls: "tag-inuse" },
      { label: "Damaged · 1", cls: "tag-damaged" },
    ],
  },
  {
    name: "FLORIST",
    count: 2,
    checked: 50,
    scanIn: 50,
    tags: [
      { label: "Ready · 1", cls: "tag-ready" },
      { label: "In Use · 1", cls: "tag-inuse" },
    ],
  },
  {
    name: "GUEST TABLE",
    count: 3,
    checked: 67,
    scanIn: 67,
    tags: [
      { label: "In Use · 2", cls: "tag-inuse" },
      { label: "Ready · 1", cls: "tag-ready" },
    ],
  },
  {
    name: "LABOUR",
    count: 1,
    checked: 0,
    scanIn: 0,
    tags: [{ label: "Ready · 1", cls: "tag-ready" }],
  },
  {
    name: "LOUNGE",
    count: 2,
    checked: 100,
    scanIn: 100,
    tags: [{ label: "In Use · 2", cls: "tag-inuse" }],
  },
];

function pctToFillClass(pct: any) {
  if (pct >= 100) return "fill-100";
  if (pct >= 75) return "fill-75";
  if (pct >= 67) return "fill-67";
  if (pct >= 50) return "fill-50";
  if (pct >= 33) return "fill-33";
  return "fill-0";
}

type Props = {};

const Page = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventId, setEventId] = useState("");
  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [loadingGet, setLoadingGet] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  const [sort, setSort] = useState<SortType>("ASC");
  const [sort_by, setSort_by] = useState<string>("item_name");
  const [areaList, setAreaList] = useState<any | null>(null);
  const [selectedArea, setSelectedArea] = useState<any | null>("all");
  const [selectedStatus, setSelectedStatus] = useState<any | null>("all");
  const [listEvent, setListEvent] = useState<any[]>([]);

  const handleFetch = async (eventId: string, selected?: string) => {
    setLoadingGet(true);
    let eventDetail: any = await fetch(`/api/event?eventId=${eventId}`);
    eventDetail = await eventDetail.json();
    setEventDetail(eventDetail.data);
    let summary: any = await InventoryService.getEventSummary(eventId);
    setSummary(summary);
    if (eventDetail.data) {
      try {
        let listArea: any = await InventoryService.getListAreaByEvent(eventId);
        const listingArea = listArea?.map((item: any) => {
          return {
            label: item.area_name,
            value: item.area_id,
          };
        });
        if (listingArea.length) {
          setSelectedArea("all");
        }
        setAreaList([...[{ value: "all", label: "All Area" }], ...listingArea]);
      } catch (error: any) {
        setAreaList([{ value: "all", label: "All Area" }]);
        setLoadingGet(false);
      }
    }
    setLoadingGet(false);
  };

  const getListEvent = async (size?: number) => {
    try {
      const response = await InventoryService.getEvent({
        page,
        limit: 99999,
        search: "",
        sort: "ASC",
        sortBy: "name",
      });
      setListEvent(response.data);
    } catch (error: any) {}
  };

  const { data: eventStatus, refetch: refetchEventStatus } = useGetEventStatus({
    options: {
      enabled: true,
      onSuccess: ({ data }) => {
        setSelectedStatus(
          data?.data?.find((el: any) => el.order_data === 1)?.id ?? "all"
        );
      },
    },
  });

  const onChangeArea = (e: any) => {
    setSelectedArea(e.target.value);
  };

  useEffect(() => {
    // getListProduct()
    let event: any = searchParams.get("event");
    if (event) {
      setEventId(event);
    } else {
      return;
    }
    refetchEventStatus();
    handleFetch(event);
    setSelectedArea("all");
    getListEvent();
  }, [searchParams]);

  useEffect(() => {
    if (eventId) {
      handleFetch(eventId);
      setSelectedArea("all");
    }
  }, [eventId]);

  const statCards = [
    {
      label: "TOTAL ITEMS",
      value: summary?.total_summary?.total_items ?? 0,
      sub: `Total qty: ${summary?.total_summary?.total_qty} units`,
      color: "blue",
    },
    {
      label: "CHECKED",
      value: summary?.total_summary?.checked ?? 0,
      sub: `${summary?.total_summary?.checked_percentage ?? 0}% of all items`,
      color: "green",
    },
    {
      label: "SCAN IN",
      value: summary?.total_summary?.scan_in ?? 0,
      sub: `${summary?.total_summary?.scan_in_percentage ?? 0}% scanned in`,
      color: "purple",
    },
    {
      label: "SCAN OUT",
      value: summary?.total_summary?.scan_out ?? 0,
      sub: `${summary?.total_summary?.scan_out_percentage ?? 0}% scanned out`,
      color: "teal",
    },
  ];

  const progressItems = [
    {
      label: "Checking Completion",
      val: summary?.total_summary?.checked ?? 0,
      total: summary?.total_summary?.total_items ?? 0,
      pct: summary?.total_summary?.checked_percentage ?? 0,
      fill: "fill-blue",
    },
    {
      label: "Scan In Completion",
      val: summary?.total_summary?.scan_in ?? 0,
      total: summary?.total_summary?.total_items ?? 0,
      pct: summary?.total_summary?.scan_in_percentage ?? 0,
      fill: "fill-purple",
    },
    {
      label: "Scan Out Completion",
      val: summary?.total_summary?.scan_out ?? 0,
      total: summary?.total_summary?.total_items ?? 0,
      pct: summary?.total_summary?.scan_out_percentage ?? 0,
      fill: "fill-green",
    },
  ];

  const areaSummary = useMemo(() => {
    if (!summary || !summary?.area_summary?.length) {
      return [];
    } else {
      return summary?.area_summary?.map((el: any) => {
        return {
          name: el.area_name,
          count: el.total_items,
          checked: el.checked,
          scanIn: el.scan_in,
          scanOut: el.scan_out,
          tags: [],
        };
      });
    }
  }, [summary]);
  const onSort = (field: string) => {
    setSort_by(field);
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const listEventStatus: ValueLabel[] = eventStatus?.data?.data?.length
    ? eventStatus?.data.data.map?.((el: any) => {
        return {
          label: el.name,
          value: el.id,
        };
      })
    : [];

  const onChangeStatus = (e: any) => {
    setSelectedStatus(e.target.value);
  };

  const { data: users } = useGetUsers({
    params: {
      page,
      limit: 1000,
      sort_dir: "ASC",
      sort_by: "fullname",
    },
    options: {
      enabled: true,
    },
  });
  console.log(users);
  const renderHeader1 = () => {
    return (
      <div className="flex justify-content-between pb-4">
        <div>
          <a style={{ fontSize: 14, color: "#000", marginRight: 200 }}>
            Item Details
          </a>
          <span className="p-input-icon-left p-input-icon-right mr-4">
            <i className="pi pi-search" style={{ top: 8 }} />
            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search items..."
            />
            {searchValue && (
              <i
                onClick={() => setSearchValue("")}
                className="pi pi-times cursor-pointer"
              />
            )}
          </span>
        </div>

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
            placeholder="Select area"
            className="flex-1"
            // style={{ width: "100%"}}
          />
        </div>
      </div>
    );
  };
  const header1 = renderHeader1();

  const filteringItemDetails = useMemo(() => {
    if (!summary || !summary?.item_details?.length) {
      return [];
    } else if (selectedArea === "all") {
      return summary?.item_details?.filter(
        (el: any) =>
          (el.item_name && el.item_name.match(new RegExp(searchValue, "i"))) ||
          (el.area_name && el.area_name.match(new RegExp(searchValue, "i")))
      );
    } else {
      const area = areaList?.find(
        (el: any) => el.value === selectedArea
      )?.label;
      return summary?.item_details
        ?.filter((el: any) => el.area_name === area)
        ?.filter(
          (el: any) =>
            (el.item_name &&
              el.item_name.match(new RegExp(searchValue, "i"))) ||
            (el.area_name && el.area_name.match(new RegExp(searchValue, "i")))
        );
    }
  }, [selectedArea, areaList, searchValue]);

  return (
    <>
      <style>{css}</style>
      <div className="dashboard">
        <div className="flex justify-content-between pb-4 relative">
          <div className="flex flex-row items-center">
            <div style={{ bottom: 32, position: "absolute" }}>
              <i
                onClick={() => router.back()}
                className="pi pi-chevron-left mr-3 cursor-pointer"
                style={{ color: "#9ca3af" }}
              />
            </div>
            <a
              style={{
                fontSize: 18,
                color: "#000000",
                fontWeight: "bold",
                paddingLeft: 30,
              }}
            >
              Event Summary
            </a>
          </div>
          <div className="flex flex-row items-center">
            <Dropdown
              value={eventId}
              onChange={(e) => setEventId(e.value)}
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
            <Button
              label="Print Report"
              icon="pi pi-print"
              severity="help"
              disabled={!listEvent?.length}
              className="button px-4"
              style={{ width: 150 }}
              onClick={() => window.print()}
            />
          </div>
        </div>
        {/* Header */}
        <div className="header">
          <span className="header-title">{eventDetail?.name}</span>
          <div className="header-meta">
            <span className="meta-item">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {moment(
                eventDetail?.date_event
                  ? eventDetail?.date_event
                  : eventDetail?.date_start
              )?.format("MMM DD, YYYY")}
            </span>
            <span className="meta-item">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {eventDetail?.address}
            </span>
            <span className="meta-item">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 20a7 7 0 0 1 13 0" />
              </svg>
              {eventDetail?.PIC}
            </span>
            <span className="meta-item">
              Code: <strong>{eventDetail?.event_code}</strong>
            </span>
            <span className="badge-completed">
              {
                eventStatus?.data?.data?.find(
                  (el: any) => el.id === eventDetail?.status
                )?.name
              }
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="progress-section">
          <h2>Completion Progress</h2>
          <div className="progress-list">
            {progressItems.map((p) => (
              <div key={p.label} className="progress-item">
                <div className="progress-header">
                  <span>{p.label}</span>
                  <strong>
                    {p.val} / {p.total} ({p.pct}%)
                  </strong>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${p.fill}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas */}
        <div className="areas-section">
          <h2>Items by Area</h2>
          <div className="areas-grid">
            {areaSummary.map((a: any) => (
              <div key={a.name} className="area-card">
                <div className="area-card-header">
                  <span className="area-name">{a.name}</span>
                  <span className="area-count">{a.count} items</span>
                </div>

                <div className="area-row">
                  <span className="dot dot-blue" />
                  <span className="area-row-label">Checked</span>
                  <div className="mini-track">
                    <div
                      className={`mini-fill fill-blue ${pctToFillClass(
                        a.checked
                      )}`}
                    />
                  </div>
                  <span className="area-row-pct">{a.checked}%</span>
                </div>

                <div className="area-row">
                  <span className="dot dot-purple" />
                  <span className="area-row-label">Scan In</span>
                  <div className="mini-track">
                    <div
                      className={`mini-fill fill-purple ${pctToFillClass(
                        a.scanIn
                      )}`}
                    />
                  </div>
                  <span className="area-row-pct">{a.scanIn}%</span>
                </div>

                <div className="area-row">
                  <span className="dot dot-red" />
                  <span className="area-row-label">Scan Out</span>
                  <div className="mini-track">
                    <div
                      className={`mini-fill fill-red ${pctToFillClass(
                        a.scanIn
                      )}`}
                    />
                  </div>
                  <span className="area-row-pct">{a.scanOut}%</span>
                </div>

                <div className="area-tags">
                  {a.tags.map((t: any) => (
                    <span key={t.label} className={`tag ${t.cls}`}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="progress-section mt-4">
          <DataTable
            value={filteringItemDetails}
            paginator
            className="p-datatable-gridlines"
            onPage={(e) => {
              setFirst(e.first);
              setPage(Number(e.page) + 1);
            }}
            rows={10}
            dataKey="id"
            totalRecords={filteringItemDetails.length}
            tableStyle={{ fontSize: 13 }}
            first={first}
            alwaysShowPaginator
            loading={loadingGet}
            responsiveLayout="scroll"
            emptyMessage="No items found."
            header={header1}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="{first} to {last} of {totalRecords} events"
            onSort={(e) => onSort(e.sortField)}
            sortField={sort_by}
            sortOrder={sort === "ASC" ? 1 : -1}
          >
            <Column
              field="item_name"
              header="ITEM NAME"
              headerStyle={{ color: "#9ca3af" }}
              filterPlaceholder="Search by name"
              style={{ paddingTop: 8, paddingBottom: 8 }}
            />
            <Column
              field="area_name"
              header="AREA"
              headerStyle={{ color: "#9ca3af" }}
              filterPlaceholder="Search by name"
              style={{ paddingTop: 8, paddingBottom: 8 }}
            />
            <Column
              field="qty"
              header="QTY"
              headerStyle={{ color: "#9ca3af" }}
              filterPlaceholder="Search by name"
              style={{ paddingTop: 8, paddingBottom: 8 }}
            />
            <Column
              field="created_at"
              header="CHECKING"
              headerStyle={{ color: "#9ca3af" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <Checkbox
                  onChange={(e) => undefined}
                  checked={data.is_checking}
                ></Checkbox>
              )}
            />
            <Column
              field="created_at"
              header="SCAN IN"
              headerStyle={{ color: "#9ca3af" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <Checkbox
                  onChange={(e) => undefined}
                  checked={data.is_scan_in}
                ></Checkbox>
              )}
            />
            <Column
              field="created_at"
              header="SCAN OUT"
              headerStyle={{ color: "#9ca3af" }}
              filterPlaceholder="Search by name"
              style={{ minWidth: "3rem", paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <Checkbox
                  onChange={(e) => undefined}
                  checked={data.is_scan_out}
                ></Checkbox>
              )}
            />
            <Column
              field="input_by"
              header="PIC"
              headerStyle={{ color: "#9ca3af" }}
              filterPlaceholder="Search by name"
              style={{ paddingTop: 8, paddingBottom: 8 }}
              body={(data: any) => (
                <div>
                  <div className="flex flex-row items-center">
                    <a style={{ color: '#4b5563', paddingRight: 4 }}>{`Input by:`}</a>
                    <a style={{ color: '#4b5563' }} className="font-semibold">
                      {data.input_by?.length
                        ? data.input_by
                        : users?.data?.users[Math.floor(Math.random() * 4) + 1]
                            ?.fullname}
                    </a>
                  </div>
                  {data.scan_in_by?.length ? (
                    <div className="flex flex-row items-center mt-1">
                      <a style={{ color: '#4b5563', paddingRight: 4  }}>{`Scan IN by:`}</a>
                      <a style={{ color: '#4b5563' }}  className="font-semibold">
                        {data.scan_in_by?.join(" ,")}
                      </a>
                    </div>
                  ) : null}
                  {data.scan_out_by?.length ? (
                    <div className="flex flex-row items-center  mt-1">
                      <a style={{ color: '#4b5563', paddingRight: 4  }}>{`Scan Out by:`}</a>
                        <a style={{ color: '#4b5563' }}  className="font-semibold">
                        {data.scan_out_by?.join(" ,")}
                      </a>
                    </div>
                  ) : null}
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
    </>
  );
};

export default Page;
