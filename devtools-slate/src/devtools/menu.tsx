import React from "react";
import { Node, Path } from "slate";
import { ReactEditor } from "slate-react";
import { useDevEditorRead } from "../atom/devEditor";
import { useSearchedPropertiesSet } from "../atom/searchedPath";
import { useSelectedPropertiesRead } from "../atom/selectedProperties";
import { RenderPath } from "../components/renderPath";
import { Search } from "../components/search";
import { UpdateButtons } from "./updateButtons";

type Props = {
  editor: ReactEditor;
  value: Node[];
  devValue: Node[];
};

export const Menu = ({ editor, value, devValue }: Props) => {
  const [{ path }] = useSelectedPropertiesRead();
  const [devEditor] = useDevEditorRead();
  const [, setSearchedProperties] = useSearchedPropertiesSet();

  /**
   * If onSearchSubmit returns true then input will set to startValue, else there will be no change
   * in input
   *
   * We will parse the value with JSON.parse() if it throws error then we will catch that error and
   * will return false
   *
   * IF the parsed value is not an path then we ourself will throw an error
   *
   * if parsed value is path then we get the node located at that path and set that as searchedProperties
   * and return true
   *
   * if there is no node at that path then Node.get itself will throw error we will just catch that in another block and
   * set a emptyProperty as searchedProperty and return true
   *
   */

  const onSearchSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    value: string
  ) => {
    e.preventDefault();
    try {
      const path = JSON.parse(value);
      if (!Path.isPath(path)) throw new Error("The parsed value is not path");
      try {
        const searchedNode = Node.get(devEditor, path);
        setSearchedProperties({ node: searchedNode, path: path });
      } catch (err) {
        setSearchedProperties({ node: { children: [] }, path: [] });
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <div className="flex items-center gap-x-21">
      <UpdateButtons editor={editor} value={value} devValue={devValue} />
      <div className="flex gap-x-3">
        <div className="font-semibold text-green-500 text-sm">
          Selected Path :
        </div>
        <RenderPath path={path} />
      </div>
      <Search startValue={`[  ]`} onSubmit={onSearchSubmit} />
    </div>
  );
};
