import { chart, data, records, schema } from "@i2analyze/notebook-sdk";
import { ReactNode } from "react";

import "./ImageRow.css";

import { LinkIcon } from "./LinkIcon";
import { FilterItemTypeId, ListItemsMode } from "./Types";

function formatRecordValue(
  property: schema.IChartPropertyType,
  record: records.IChartRecord,
  formatter: data.IFormatter
) {
  const value = record.getProperty(property);
  if (record.isValueUnfetched(value)) {
    return formatter.wrapForBidi("Value not fetched", "raw");
  } else {
    const formattedValue = formatter.formatValueOrUndefined(value);
    return formattedValue && formatter.wrapForBidi(formattedValue, "raw");
  }
}

function getBaseRow(record: records.IChartRecord): IListItemRow {
  return {
    id: record.id,
    label: {
      node: (
        <div className="label-cell">
          {getRecordImage(record)}{" "}
          <span className="row-text">{record.labelOrFallback}</span>
        </div>
      ),
      sortValue: record.labelOrFallback,
    },
    itemType: record.itemType.displayName,
    analyzeRecordId: record.id,
  };
}

function getBaseLinkRow(record: records.IChartLinkRecord) {
  return {
    ...getBaseRow(record),
    // TODO Format direction
    direction: record.linkDirection,
    fromEndLabel: record.fromEnd.labelOrFallback,
    toEndLabel: record.toEnd.labelOrFallback,
  };
}

function getRecords<T extends records.IChartRecord>(
  records: data.IKeyedReadOnlyCollection<records.AnalyzeRecordId, T>,
  itemTypeFilter: FilterItemTypeId
): data.IReadOnlyCollection<T> {
  return itemTypeFilter === "all"
    ? records
    : records.filter((r) => r.itemType.id === itemTypeFilter);
}

function getItemTypes(
  set: Set<schema.ChartItemTypeId>,
  schema: schema.IChartSchema
): IListItemType[] {
  return Array.from(set.values()).map((id) => ({
    id,
    label: schema.itemTypes.get(id)!.displayName,
  }));
}

export function processChartSelection(
  mode: ListItemsMode,
  itemTypeFilter: FilterItemTypeId,
  selection: chart.ISelection,
  formatter: data.IFormatter,
  schema: schema.IChartSchema
): {
  rows: IListItemRow[];
  headings: IListItemHeading[];
  itemTypes: IListItemType[];
} {
  const itemTypeSet = new Set<schema.ChartItemTypeId>();
  if (itemTypeFilter === "all") {
    if (mode === "entity") {
      const records = getRecords(selection.entityRecords, "all");
      const rows = Array.from(
        records.map((record) => {
          itemTypeSet.add(record.itemType.id);
          return getBaseRow(record);
        })
      );

      return {
        rows,
        headings: allEntityHeadings,
        itemTypes: getItemTypes(itemTypeSet, schema),
      };
    } else {
      const records = getRecords(selection.linkRecords, "all");
      const rows = Array.from(
        records.map((record) => {
          itemTypeSet.add(record.itemType.id);
          return getBaseLinkRow(record);
        })
      );

      return {
        rows,
        headings: allLinkHeadings,
        itemTypes: getItemTypes(itemTypeSet, schema),
      };
    }
  } else {
    if (mode === "entity") {
      const records = getRecords(selection.entityRecords, itemTypeFilter);

      const headings = [
        ...allEntityHeadings,
        ...schema.entityTypes.get(itemTypeFilter)!.propertyTypes.map((pt) => ({
          key: pt.id.toString(),
          header: formatter.wrapForBidi(pt.displayName, "raw"),
          sorting: "neither" as const,
        })),
      ];

      const rows = Array.from(
        records.map((record) => {
          const row: IListItemRow = { ...getBaseRow(record) };
          itemTypeSet.add(record.itemType.id);

          for (const property of record.itemType.propertyTypes) {
            row[property.id.toString()] =
              formatRecordValue(property, record, formatter) || "";
          }
          return row;
        })
      );

      return { rows, headings, itemTypes: getItemTypes(itemTypeSet, schema) };
    } else {
      const records = getRecords(selection.linkRecords, itemTypeFilter);

      const headings = [
        ...allLinkHeadings,
        ...schema.linkTypes.get(itemTypeFilter)!.propertyTypes.map((pt) => ({
          key: pt.id.toString(),
          header: formatter.wrapForBidi(pt.displayName, "raw"),
          sorting: "neither" as const,
        })),
      ];

      const rows = Array.from(
        records.map((record) => {
          const row: IListItemRow = { ...getBaseLinkRow(record) };
          itemTypeSet.add(record.itemType.id);

          for (const property of record.itemType.propertyTypes) {
            row[property.id.toString()] =
              formatRecordValue(property, record, formatter) || "";
          }
          return row;
        })
      );

      return { rows, headings, itemTypes: getItemTypes(itemTypeSet, schema) };
    }
  }
}

export interface IListItemHeading {
  readonly key: string;
  readonly header: string;
}

export interface ISortableCell {
  node: ReactNode;
  sortValue: string;
}

export type IListItemRow = Record<string, string | ISortableCell> & {
  id: records.AnalyzeRecordId;
};

export interface IListItemType {
  id: schema.ChartItemTypeId;
  label: string;
}

const allEntityHeadings: IListItemHeading[] = [
  {
    key: "label",
    header: "Label",
  },
  {
    key: "itemType",
    header: "Type",
  },
  {
    key: "analyzeRecordId",
    header: "Id",
  },
];

const allLinkHeadings: IListItemHeading[] = [
  ...allEntityHeadings,
  {
    key: "direction",
    header: "Direction",
  },
  {
    key: "fromEndLabel",
    header: "From End Label",
  },
  {
    key: "toEndLabel",
    header: "To End Label",
  },
];

function getRecordImage(record: records.IChartRecord) {
  return record.isEntity()
    ? getEntityRecordImage(record)
    : getLinkRecordImage(record);
}

function getEntityRecordImage(record: records.IChartEntityRecord) {
  const image = record.image || record.itemType.image;
  return <img src={image.href} alt={image.description} className="row-image" />;
}

function getLinkRecordImage(record: records.IChartLinkRecord) {
  if (record.image) {
    return (
      <img
        src={record.image.href}
        alt={record.image.description}
        className="row-image"
      />
    );
  }

  return <LinkIcon direction={record.linkDirection} />;
}
