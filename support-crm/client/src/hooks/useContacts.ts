import { useQuery } from "@tanstack/react-query";
import { contactService } from "../services/contact.service";

export const useContacts = () =>
  useQuery({
    queryKey: ["contacts"],
    queryFn: () => contactService.list(),
  });
