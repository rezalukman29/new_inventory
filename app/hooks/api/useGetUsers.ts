import { useQuery, UseQueryOptions } from "react-query";

import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import axEmi from "@/app/service/axiosEmi";

export const getUsers = async ({
  params,
}: {
  params: any;
}): Promise<any> => {
  const response = await axEmi.get(`/v2/get-all-user`, { params });
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
