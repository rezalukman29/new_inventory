import { useQuery, UseQueryOptions } from "react-query";

import { APIResponse, BaseResponsePagination } from "@/app/interfaces/BaseApiResponse";
import ax from "@/app/service/axios";

export const getLogActivity = async ({
  module,
  page,
  limit,
}: {
  module: string;
  page: number;
  limit: number;
}): Promise<APIResponse<BaseResponsePagination<any>>> => {
  const response = await ax.get(`/v1/api-log`, {
    params: {
      ...(module && { module }),
      ...(page && { page }),
      ...(limit && { limit }),
    },
  });
  return response.data;
};

const useGetLogActivity = ({
  options,
  module,
  page,
  limit,
}: {
  options?: UseQueryOptions<APIResponse<BaseResponsePagination<any>>> ;
  module: string;
  page: number;
  limit: number;
}) => {
  return useQuery<APIResponse<BaseResponsePagination<any>>> (
    ["useGetLogActivity"],
    () => getLogActivity({ module, page, limit }),
    options
  );
};

export default useGetLogActivity;
