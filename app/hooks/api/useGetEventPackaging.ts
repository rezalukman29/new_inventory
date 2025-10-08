import { useQuery, UseQueryOptions } from "react-query";

import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import ax from "@/app/service/axios";

export const getEventPackaging = async ({
  params,
}: {
  params: any;
}): Promise<APIResponse<any[]>> => {
  const response = await ax.get(`/v1/event-item-package`, {
    params: {
      event_id: params.event_id,
      package_id: params.package_id,
    },
  });
  return response.data;
};

const useGetEventPackaging = ({
  options,
  params,
}: {
  options?: UseQueryOptions<APIResponse<any[]>>;
  params: any;
}) => {
  return useQuery<APIResponse<any[]>>(
    ["useGetEventPackaging"],
    () => getEventPackaging({ params }),
    options
  );
};

export default useGetEventPackaging;
