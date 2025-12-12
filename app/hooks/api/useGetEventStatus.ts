import { useQuery, UseQueryOptions } from "react-query";

import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import ax from "@/app/service/axios";

export const getEventStatus = async (): Promise<APIResponse<any>> => {
  const response = await ax.get(`/v1/event-status/get-all`);
  return response.data;
};

const useGetEventStatus = ({
  options,
}: {
  options?: UseQueryOptions<APIResponse<any>>;
}) => {
  return useQuery<APIResponse<any>>(
    ["useGetEventStatus"],
    () => getEventStatus(),
    options
  );
};

export default useGetEventStatus;
