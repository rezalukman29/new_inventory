import { ValueLabel } from "../interfaces/interfaces";

export const STATUS_EVENT: Array<StatusEventInterface> = [
    {
      id: 1,
      status: "created by admin",
    },
    {
      id: 2,
      status: "on preparing item",
    },
    {
      id: 3,
      status: "finish setup",
    },
    {
      id: 4,
      status: "waiting scan in",
    },
    {
      id: 5,
      status: "event running",
    },
    {
      id: 6,
      status: "waiting scan out",
    },
    {
      id: 7,
      status: "finished",
    },
    {
      id: 8,
      status: "disable",
    },
    {
      id: 9,
      status: "on the truck",
    },
  ];

  export interface StatusEventInterface {
    id: number;
    status: string;
  }

  export const ADDITIONAL_WAREHOUESE: ValueLabel[] = [
    {
      label: "Rent",
      value: 991,
    },
    {
      label: "House Production",
      value: 992,
    },
    {
      label: "Buy",
      value: 993,
    },
  ];

  export const ADDITIONAL_CODE: ValueLabel[] = [
    {
      label: "IHC",
      value: "IHC",
    },
    {
      label: "IHO",
      value: "IHO",
    },
    {
      label: "O",
      value: "O",
    },
    {
      label: "S",
      value: "S",
    },
    {
      label: "B",
      value: "B",
    },
    {
      label: "F",
      value: "F",
    },
    {
      label: "VENUE",
      value: "VENUE",
    },
  ];

  export const SCAN_TYPE = [
    {
      value: "GROUP",
      label: "GROUP"
    },
    {
      value: "INDIVIDUAL",
      label: "INDIVIDUAL"
    },

  ]