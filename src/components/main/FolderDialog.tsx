import React, { useEffect, useState } from 'react'
import { ItemType } from '.';
import Folders from './Folders';
import Files from './Files';
import LoaderDialog from './LoaderDialog';

type FolderDialogProps = {
  item: ItemType | null;
  setItem: Function;
  handleUpload: Function;
  loadFiles: Function;
  setFilesInGroup: Function;
  filesInGroup: ItemType[];
  deleteFile: Function;  
  visibleMenuId: string;
  setVisibleMenuId: Function;
  handleDragStart: Function;
  setFile: Function;
  updateFileName: Function;
}

const FolderDialog = (props: FolderDialogProps) => {
  const { handleDragStart, setVisibleMenuId, visibleMenuId, deleteFile, item, setItem, handleUpload, loadFiles, setFilesInGroup, filesInGroup, setFile, updateFileName } = props;
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    if (item) {
      loadFiles(item.id)
    }
  }, [item]);

  const closeDialog = () => {
    setItem(null)
  }

  const handleDrop = async (event: any) => {
    event.preventDefault();
    const files = [];
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      if (event.dataTransfer.items[i].kind === 'file') {
        const file = event.dataTransfer.items[i].getAsFile();
        files.push(file);
      }
    }
    if (files.length > 0) {
      setLoader(true)
      await handleUpload(files[0], item?.id)
      loadFiles(item?.id);
      setLoader(false);
      return;
    }

    const { clientX, clientY } = event;
    const { clientX: startX, clientY: startY, id } = JSON.parse(event.dataTransfer.getData("text"));

    setFilesInGroup((prevFiles: ItemType[]) =>
      prevFiles.map((file) => {
        if (file.id === id) {
          const newPosition = {
            x: clientX - startX + file.position.x,
            y: clientY - startY + file.position.y,
          };

          localStorage.setItem(file.id, JSON.stringify(newPosition));

          return {
            ...file,
            position: newPosition,
          };
        }
        return file;
      })
    );
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="absolute w-full m-auto flex justify-center z-50 bg-white">
      {loader && <LoaderDialog />}
      <div className="window scale-down w-full min-h-[80vh]">
        <div className="title-bar">
          <button aria-label="Close" onClick={() => closeDialog()} className="close"></button>
          <h1 className="title">{item?.name}</h1>
          <button aria-label="Resize" disabled className="hidden"></button>
        </div>
        <div className="separator"></div>

        <div className="modeless-dialog">
          <Files updateFileName={updateFileName} deleteFile={deleteFile} setFile={setFile} visibleMenuId={visibleMenuId} setVisibleMenuId={setVisibleMenuId} handleDragStart={handleDragStart} files={filesInGroup} />
        </div>        
      </div>
    </div>
  )
}

export default FolderDialog