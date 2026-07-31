import { useQuery } from "@tanstack/react-query";
import { vendorService } from "../services/vendor.service";

export const useVendors = () =>
  useQuery({
    queryKey: ["vendors"],
    queryFn: () => vendorService.list(),
  });
