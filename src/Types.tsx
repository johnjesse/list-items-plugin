import { schema } from "@i2analyze/notebook-sdk";

export type ListItemsMode = "entity" | "link";
export type SortingType = "ascending" | "descending" | "neither";
export type FilterItemTypeId = "all" | schema.ChartItemTypeId;
