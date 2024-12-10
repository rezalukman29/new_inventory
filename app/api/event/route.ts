import ax from "@/app/service/axios";
import axios from "axios";
import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";

type ResponseData = {
  message: string;
};

export async function GET(
  req: NextRequest,
  res: NextApiResponse<ResponseData>
) {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get("page");
  const eventId = searchParams.get("eventId");

  if (eventId) {
    let response = await ax
      .get(`/v1/event/${eventId}`, {
        headers: {
          "User-Id": 8,
        },
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error.response;
      });

    return Response.json({ data: response.data.data });
  } else {
    let response = await ax
      .get(`/v1/event/page/${page}`, {
        headers: {
          "User-Id": 8,
        },
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error.response;
      });

    return Response.json({ data: response.data.data });
  }
}
