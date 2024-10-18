import React, { useState } from 'react'
import { ItemType } from '.';
import Folder from '../icons/folder';
import File from '../icons/file';
import VideoFile from '../icons/videoFile';

type FoldersProps = {
  handleDragStart: Function;
  files: ItemType[] 
  visibleMenuId: string;
  setVisibleMenuId: Function;
  setFile: Function;
  deleteFile: Function;
}

const Files = (props: FoldersProps) => {
  const { handleDragStart, files, visibleMenuId, setVisibleMenuId, setFile, deleteFile } = props;

  const handleContextMenu = (e: any, id: string) => {
    e.preventDefault()
    setVisibleMenuId(id)
  }

  const handleDelete = async (id: string) => {
    setVisibleMenuId("")
    await deleteFile(id)
  }

  return (
    <div>
      {files.map((f) => (
        <div
          onContextMenu={(e) => handleContextMenu(e, f.id)}
          key={f.id}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, f.id)}
          className="absolute cursor-pointer w-20"
          style={{ left: `${f.position.x}px`, top: `${f.position.y}px` }}
          onDoubleClick={() => setFile(f)}
        >{visibleMenuId && visibleMenuId === f.id &&
          <div className="absolute top-10 left-8 z-40">
            <ul className="" role="menu">
              <li role="menu-item"><a onClick={() => setFile(f)} href="#">Open file</a></li>
              <li role="menu-item"><a onClick={() => handleDelete(f.id)} href="#">Delete file</a></li>
            </ul>
          </div>}
          {f.mimeType?.includes("video") ? 
            <VideoFile /> : <File />
          }          
          <p className="text-center text-ellipsis overflow-hidden">{f.name}</p>
        </div>
      ))}
    </div>
  )
}

export default Files