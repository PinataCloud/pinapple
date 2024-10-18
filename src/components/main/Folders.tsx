import React, { useState } from 'react';
import { ItemType } from '.';
import Folder from '../icons/folder';

type FoldersProps = {
  handleDragStart: Function;
  folders: ItemType[];
  deleteFolder: Function;
  visibleMenuId: string;
  setVisibleMenuId: Function;
  setFolder: Function;
  handleDragEnterFolder: (folderId: string) => void;
  handleDragLeaveFolder: (folderId: string) => void;
};

const Folders = (props: FoldersProps) => {
  const { handleDragStart, folders, deleteFolder, visibleMenuId, setVisibleMenuId, setFolder, handleDragEnterFolder, handleDragLeaveFolder } = props;

  const handleContextMenu = (e: any, id: string) => {
    e.preventDefault();
    setVisibleMenuId(id);
  };

  const handleDelete = async (id: string) => {
    setVisibleMenuId('');
    await deleteFolder(id);
  };

  return (
    <div>
      {folders.map((f) => (
        <div
          onContextMenu={(e) => handleContextMenu(e, f.id)}
          key={f.id}
          id={f.id}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, f.id)}
          className="absolute cursor-pointer z-30 p-4"
          style={{ left: `${f.position.x}px`, top: `${f.position.y}px` }}
          onDoubleClick={() => setFolder(f)}
          onDragOver={(e) => e.preventDefault()} 
          onDragEnter={() => { handleDragEnterFolder(f.id)}} 
          onDragLeave={() => handleDragLeaveFolder(f.id)} 
        >
          {visibleMenuId && visibleMenuId === f.id && (
            <div className="absolute top-10 left-8 z-40">
              <ul className="" role="menu">
                <li role="menu-item">
                  <a onClick={() => setFolder(f)} href="#">
                    Open folder
                  </a>
                </li>
                <li role="menu-item">
                  <a onClick={() => handleDelete(f.id)} href="#">
                    Delete folder
                  </a>
                </li>
              </ul>
            </div>
          )}
          <Folder />
          <p className="text-center">{f.name}</p>
        </div>
      ))}
    </div>
  );
};

export default Folders;