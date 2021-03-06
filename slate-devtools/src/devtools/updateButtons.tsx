import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Node, Operation } from "slate";
import { ReactEditor } from "slate-react";
import { useDevEditorRead } from "../atom/devEditor";
import { useUpdateApp } from "../atom/updateApp";
import { useUpdateDevtools } from "../atom/updateDevtools";
import { Button } from "../components/button/button";
import { styled } from "../styles/stitches.config";
import { Batch } from "../util/batch";
import { DTOperation } from "../util/DTOperation";
import { DevtoolsEditor } from "../plugins/withDevtools";
import {
  dont_save_to_history,
  dont_update_app_operations,
} from "../util/weekmap";

type Props = {
  editor: ReactEditor & DevtoolsEditor;
  value: Node[];
  devValue: Node[];
};

export const UpdateButtons = ({ editor, value, devValue }: Props) => {
  const [updateDevtools, setUpdateDevtools] = useUpdateDevtools();
  const [updateApp, setUpdateApp] = useUpdateApp();
  const [devEditor] = useDevEditorRead();

  /**
   * isDevtoolsUpdating stores weather the devtools is updating after clicking
   * `update Devtools
   */
  const isDevtoolsUpdating = useRef<boolean>(false);

  /**
   * Stores every operation applied to app (editor)
   */
  const appOperations = useRef<Batch[]>([]);

  /**
   * stores every operation applied to devtools (devEditor)
   */
  const devtoolsOperations = useRef<DTOperation<Operation>[]>([]);

  /**
   * Ref for the button `Update App`
   */
  const updateAppRef = useRef<HTMLButtonElement | null>(null);

  /**
   * At first we will check if the operation applied to app (editor) is due to clicking
   * `Update App` if thats the case then we wont add those operation to appOperation
   * and we set isAppUpdating to false
   *
   * IF thats not case then we will those operations to appOperations.
   *
   * Works only on useLayoutEffect not on useEffect
   */
  useLayoutEffect(() => {
    if (dont_update_app_operations.get(editor)) {
      dont_update_app_operations.set(editor, false);
      appOperations.current = Batch.addOperationsToBatches(
        appOperations.current,
        editor.devtools_history.filter((op) => op.normalizing)
      );
      editor.devtools_reset();
      return;
    }

    appOperations.current = Batch.addOperationsToBatches(
      appOperations.current,
      editor.devtools_history
    );
    editor.devtools_reset();
  }, [value, editor]);

  /**
   * At first we will check if the operation applied to devtools (devEditor) is due to clicking `update devtools`
   * if thats the case then we wont add those operation to devtoolsOperation and we
   * set isDevtoolsUpdating to false
   *
   * If thats not the case then we will add those operations to devtoolsOperations
   *
   * Works only on useLayoutEffect not on useEffect
   */
  useLayoutEffect(() => {
    if (isDevtoolsUpdating.current) {
      isDevtoolsUpdating.current = false;
      return;
    }

    devtoolsOperations.current = DTOperation.addOperations(
      devtoolsOperations.current,
      devEditor.operations
    );
    console.log({ devtoolsOperations });
  }, [devValue, devEditor.operations]);

  /**
   * We will check if appOperations is empty if thats the case then we will set
   * `Update Devtools ` to "off" and if thats not case then we will set `Update Devtools`
   * to "on"
   */
  useEffect(() => {
    const { current } = appOperations;

    if (current.length !== 0 && updateDevtools !== "on") {
      setUpdateDevtools("on");
    } else if (current.length === 0 && updateDevtools !== "off") {
      setUpdateDevtools("off");
    }
  });

  /**
   * We will check if devtoolsOperations is empty if thats the case then we will set `Update App`
   * to "off" and if thats not case then we will set `Update App` to "on"
   */
  useEffect(() => {
    const { current } = devtoolsOperations;

    if (current.length !== 0 && updateApp !== "on") {
      setUpdateApp("on");
    } else if (current.length === 0 && updateApp !== "off") {
      setUpdateApp("off");
    }
  });

  /**
   * At first we will set isDevtoolsUpdating to true
   *
   * Then we will check if updateApp is "on" this means that user has applied some
   * operation to devtools but before syncing that operation with app the user also applied some operation
   * to app.
   *
   * As a result we have reverse those changes to devtools before updating the devtools
   *
   */

  const onUpdateDevtoolsClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    isDevtoolsUpdating.current = true;
    const batches: Batch[] = [];

    if (updateApp === "on") {
      const inverseBatch = new Batch([], {
        normalizing: false,
        location: "Devtools",
      });
      for (const op of DTOperation.inverseOperations(
        devtoolsOperations.current
      )) {
        inverseBatch.ops.push(op);
      }
      devtoolsOperations.current = [];
      batches.push(inverseBatch);
    }

    Batch.applyOperations(batches.concat(appOperations.current), devEditor);
    appOperations.current = [];
  };

  /**
   * At first we will set isAppUpdating to true
   *
   * Then we will check if updateDevtools is "on" this means that user has applied some
   * operation to app but before syncing that operation with devtools the user also applied some operation
   * to devtools.
   *
   * As a result we have reverse those changes to app before updating the app
   *
   */

  const onUpdateAppClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    dont_update_app_operations.set(editor, true);
    const operations: DTOperation<Operation>[] = [];

    if (updateDevtools === "on") {
      for (const operation of Batch.inverseOperations(appOperations.current)) {
        operations.push(operation);
      }
      appOperations.current = [];
    }
    dont_save_to_history.set(editor, true);
    DTOperation.applyOperations(
      editor,
      operations.concat(devtoolsOperations.current)
    );
    dont_save_to_history.set(editor, false);
    devtoolsOperations.current = [];
  };

  return (
    <StyledUpdateButtons>
      <Button
        color={updateDevtools === "on" ? "rose" : "gray"}
        onClick={onUpdateDevtoolsClick}
        data-cy-ub-color={updateDevtools === "on" ? "rose" : "gray"}
      >
        Update Devtools
      </Button>
      <Button
        color={updateApp === "on" ? "rose" : "gray"}
        onClick={onUpdateAppClick}
        ref={updateAppRef}
        data-cy-ub-color={updateApp === "on" ? "rose" : "gray"}
      >
        Update App
      </Button>
    </StyledUpdateButtons>
  );
};

const StyledUpdateButtons = styled("div", {
  $reset: "",
  display: "flex",
  columnGap: "1.25rem",
  fontSize: "0.75rem",
});
