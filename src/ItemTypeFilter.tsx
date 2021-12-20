import { schema } from "@i2analyze/notebook-sdk";
import { useEffect, useState } from "react";

import { useToolViewApi } from "./useToolViewApi";
import { ListItemsMode } from "./Types";

type FilterType = "all" | schema.ChartItemTypeId;

interface ItemTypeFilterProps {
  readonly selectedItemType: FilterType;
  onFilterChange(filter: FilterType): void;
  mode: ListItemsMode;
}

interface IItemType {
  id: schema.ChartItemTypeId;
  label: string;
}

const allItemType = {
  id: "all",
  label: "All",
};

export function ItemTypeFilter(props: ItemTypeFilterProps) {
  const { mode, onFilterChange, selectedItemType } = props;

  const toolViewApi = useToolViewApi();

  const [itemTypes, setItemTypes] = useState<IItemType[]>([]);

  useEffect(() => {
    return toolViewApi.addEventListener(
      "chartselectionchange",
      (selection, application) => {
        const itemTypesInSelection = new Map<
          schema.ChartItemTypeId,
          IItemType
        >();

        const records =
          mode === "entity" ? selection.entityRecords : selection.linkRecords;

        for (const record of records) {
          const { id, displayName } = record.itemType;

          if (!itemTypesInSelection.has(id)) {
            itemTypesInSelection.set(id, { id, label: displayName });
          }
        }

        setItemTypes(Array.from(itemTypesInSelection.values()));
      },
      { dispatchNow: true }
    );
  }, [toolViewApi, mode]);

  // TODO Render a menu which
  //  - Displays the current option - with a filter Icon
  //  - Allows you to click another options
  //  - Includes all in the options
  return <div />;
}
