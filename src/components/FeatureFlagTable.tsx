import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";

// import { type Flag } from "@prisma/client";
import Button from "@mui/material/Button";
import { type FlagsRouter } from "../server/api/routers/flags";
import { type inferRouterOutputs } from "@trpc/server";
import toast from "react-hot-toast";

type Flags = inferRouterOutputs<FlagsRouter>["getAll"];

type FeatureFlagTableProps = {
  rows: Flags;
};
export const FeatureFlagTable: React.FC<FeatureFlagTableProps> = ({ rows }) => {
  return (
    <TableContainer className="" component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Last Updated</TableCell>
            <TableCell>Dev</TableCell>
            <TableCell>Staging</TableCell>
            <TableCell>Prod</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <FeatureFlagRow key={row.flag.key} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

type FeatureFlagRowProps = {
  row: Flags[number];
};
const FeatureFlagRow: React.FC<FeatureFlagRowProps> = ({
  row: { flag, updatedByUser },
}) => {
  const [isEditable, setIsEditable] = useState(false);

  const handleKeyClick = async (key: string) => {
	await navigator.clipboard.writeText(key);
	toast.success("Copied to clipboard");
  }

  return (
    <TableRow
      key={flag.key}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        {flag.name}
      </TableCell>
      <TableCell><button onClick={() => void handleKeyClick(flag.key)}>{flag.key}</button></TableCell>
      <TableCell>
        <div>
          <span>{flag.updatedAt.toLocaleDateString("en-GB")} </span>
          <span>by </span>
          <a
            href={`https://github.com/${updatedByUser?.username}`}
            className="text-blue-700"
          >
            @{updatedByUser?.username}
          </a>
        </div>
      </TableCell>
      <TableCell>
        <Switch defaultChecked={flag.development} disabled={!isEditable} />
      </TableCell>
      <TableCell>
        <Switch defaultChecked={flag.staging} disabled={!isEditable} />
      </TableCell>
      <TableCell>
        <Switch defaultChecked={flag.production} disabled={!isEditable} />
      </TableCell>
      <TableCell align="right">
        <Button
          variant="contained"
          onClick={() => setIsEditable((e) => !e)}
          className="w-20"
        >
          {isEditable ? "Done" : "Edit"}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default FeatureFlagTable;
