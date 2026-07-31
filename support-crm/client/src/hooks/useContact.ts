import { useQuery } from "@tanstack/react-query";
import { contactService } from "../services/contact.service";

export const useContact = (id: number | undefined) =>
  useQuery({
    queryKey: ["contact", id],
    queryFn: () => contactService.getById(id as number),
    enabled: id !== undefined,
  });
