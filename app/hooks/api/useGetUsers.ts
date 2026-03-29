import { useQuery, UseQueryOptions } from "react-query";

import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import ax from "@/app/service/axios";

export const getUsers = async ({
  params,
}: {
  params: any;
}): Promise<any> => {
  const response = await ax.get(`/v1/get-all-user`, { params });
  return response.data;
};

const useGetUsers = ({
  params,
  options,
}: {
  params: any;
  options?: UseQueryOptions<any>;
}) => {
  return useQuery<any>(
    ["useGetUsers"],
    () => getUsers({ params }),
    options
  );
};

export default useGetUsers;
