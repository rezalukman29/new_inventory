import axios from "axios";
import { WarehouseI } from "../interfaces/WarehouseInterfaceI";
import Conn from "../service/Conn";

export async function formGetGudang() {
    return new Promise(resolved => {
      const url = 'https://democreation.site/home/public/gudang/getall';
      axios.get(url).then((response: any) => {
        let dataArray: any = Object.entries(response.data.hasil).map(
          (item: any) => item[1],
        );
        let data: Array<WarehouseI> = [];
        dataArray.forEach((item: any) => {
          typeof item === 'object' && data.push(item);
        });
        resolved(data);
      });
    });
  }

  export async function formPostEventList(payload: any) {
    return new Promise((resolved, rejected) => {
      const service = new Conn('v1/fix-event-list');
      service
        .post(payload)
        .then((data: any) => {
          setTimeout(() => {
            resolved(data.data);
          }, Math.random() * 500);
        })
        .catch((error: any) => rejected(error));
    });
  }

  
export async function formPostFixListItemV2(payload: any) {
    return new Promise((resolved, rejected) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {detail, ...newPayload} = payload;
      const service = new Conn('v2/fix-list-item');
      service
        .post(newPayload)
        .then((data: any) => {
          setTimeout(() => {
            resolved(data.data);
          }, Math.random() * 500);
        })
        .catch((error: any) => rejected(error));
    });
  }