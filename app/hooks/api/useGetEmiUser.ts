import { useQuery, UseQueryOptions } from "react-query";

import { APIResponse } from "@/app/interfaces/BaseApiResponse";
import axEmi from "@/app/service/axiosEmi";

export const getEmiUser = async (): Promise<APIResponse<any[]>> => {
  const response = await axEmi.get(`/user/get-a11-d4t4-us3r`);
  return response.data;
};

const useGetEmiUser = ({
  options,
}: {
  options?: UseQueryOptions<APIResponse<any[]>>;
}) => {
  return useQuery<APIResponse<any[]>>(
    ["useGetEmiUser"],
    () => getEmiUser(),
    options
  );
};

export default useGetEmiUser;
