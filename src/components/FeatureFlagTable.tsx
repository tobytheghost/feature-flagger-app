import React from "react";
import FeatureFlagRow, { type Flags } from "./FeatureFlagRow";

export type FeatureFlagTableProps = {
  rows: Flags;
};

export const FeatureFlagTable: React.FC<FeatureFlagTableProps> = ({ rows }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table-zebra table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Key</th>
            <th>Last Updated</th>
            <th align="right">
              <div className="flex gap-4">
                <span className="w-16 text-center">Dev</span>
                <span className="w-16 text-center">Staging</span>
                <span className="w-16 text-center">Prod</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <FeatureFlagRow key={row.flag.key} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeatureFlagTable;
