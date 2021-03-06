import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { Typography, IconButton, TextField, Switch } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { FieldType } from "constants/fields";
import OptionsInput from "./ConfigFields/OptionsInput";
import { useFiretableContext } from "contexts/firetableContext";
import MultiSelect from "@antlerengineering/multiselect";

import _sortBy from "lodash/sortBy";
import CodeEditor from "./ConfigFields/CodeEditor";
import FieldsDropdown from "./FieldsDropdown";
import ColumnSelector from "./ConfigFields/ColumnSelector";

const ConfigForm = ({ type, config, handleChange }) => {
  const { tableState, tables } = useFiretableContext();

  if (!tableState) return <></>;
  const { columns } = tableState;
  switch (type) {
    case FieldType.singleSelect:
    case FieldType.multiSelect:
      return (
        <>
          <OptionsInput
            options={config.options ?? []}
            handleChange={handleChange("options")}
          />
          <Typography variant="overline">ADD NEW?</Typography>
          <Grid container direction="row" justify="space-between">
            <Typography variant="subtitle1">
              User can add new options.
            </Typography>
            <Switch
              checked={config.freeText}
              onClick={() => {
                handleChange("freeText")(!config.freeText);
              }}
            />
          </Grid>
        </>
      );
    case FieldType.connectTable:
      const tableOptions = _sortBy(
        tables?.map(t => ({
          label: `${t.section} - ${t.name}`,
          value: t.collection,
        })) ?? [],
        "label"
      );

      return (
        <>
          <MultiSelect
            options={tableOptions}
            freeText={false}
            value={config.index}
            onChange={handleChange("index")}
            multiple={false}
          />
          <ColumnSelector
            label={"Primary Keys"}
            value={config.primaryKeys}
            table={config.index}
            handleChange={handleChange("primaryKeys")}
            validTypes={[FieldType.shortText, FieldType.singleSelect]}
          />
          <TextField
            label="filter template"
            name="filters"
            fullWidth
            onChange={e => {
              handleChange("filters")(e.target.value);
            }}
          />
        </>
      );
    case FieldType.subTable:
      return (
        <ColumnSelector
          label={"Parent Label"}
          value={config.parentLabel}
          tableColumns={
            columns
              ? Array.isArray(columns)
                ? columns
                : Object.values(columns)
              : []
          }
          handleChange={handleChange("parentLabel")}
          validTypes={[FieldType.shortText, FieldType.singleSelect]}
        />
      );

    case FieldType.action:
      return (
        <TextField
          label="callable name"
          name="callableName"
          fullWidth
          onChange={e => {
            handleChange("callableName")(e.target.value);
          }}
        />
      );
    case FieldType.derivative:
      return (
        <>
          <ColumnSelector
            label={"Listener fields"}
            value={config.listenerFields}
            tableColumns={
              columns
                ? Array.isArray(columns)
                  ? columns
                  : Object.values(columns)
                : []
            }
            handleChange={handleChange("listenerFields")}
          />
          <CodeEditor
            script={config.script}
            handleChange={handleChange("script")}
          />
          <FieldsDropdown
            value={config.renderFieldType}
            onChange={(newType: any) => {
              handleChange("renderFieldType")(newType.target.value);
            }}
          />
        </>
      );
    default:
      return <></>;
  }
};

export default function FormDialog({
  name,
  fieldName,
  type,
  open,
  config,
  handleClose,
  handleSave,
}: {
  name: string;
  fieldName: string;
  type: FieldType;
  open: boolean;
  config: any;
  handleClose: Function;
  handleSave: Function;
}) {
  const [newConfig, setNewConfig] = useState(config ?? {});

  return (
    <div>
      <Dialog
        open={open}
        onClose={(e, r) => {
          handleClose();
        }}
        aria-labelledby="form-column-settings"
      >
        <DialogContent>
          <Grid
            container
            justify="space-between"
            alignContent="flex-start"
            direction="row"
          >
            <Typography variant="h6">{name}: Settings</Typography>
            <IconButton
              onClick={() => {
                handleClose();
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
          <Typography variant="overline"></Typography>

          {
            <ConfigForm
              type={type}
              handleChange={key => update => {
                console.log(key, update);
                setNewConfig({ ...newConfig, [key]: update });
              }}
              config={newConfig}
            />
          }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSave(fieldName, { config: newConfig });
            }}
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
