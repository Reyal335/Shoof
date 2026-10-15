import { request } from "@/lib/api-client";
import type { CatalogSkill } from "./types";

/** The whole skills catalog. Public, sorted by name. */
export const getSkills = () => request<CatalogSkill[]>("/skills");
