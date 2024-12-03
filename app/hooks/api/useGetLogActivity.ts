import { useQuery, UseQueryOptions } from "react-query";

import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import ax from "@/app/service/axios";

export const getLogActivity = async ({
  module,
}: {
  module: string;
}): Promise<APIResponse<APIResponse<any[]>>> => {
  const response = await ax.get(`/v1/api-log`, {
    params: {
      ...(module && { module }),
    },
  });
  return response.data;
};

const useGetLogActivity = ({
  options,
  module,
}: {
  options?: UseQueryOptions<APIResponse<APIResponse<any[]>>>;
  module: string;
}) => {
  return useQuery<APIResponse<APIResponse<any[]>>>(
    ["useGetLogActivity"],
    () => getLogActivity({ module }),
    options
  );
};

export default useGetLogActivity;
