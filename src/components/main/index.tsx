import React, { useEffect, useRef, useState } from 'react';
import HelpWindow from './HelpWindow';
import Files from './Files';
import Menu from '../menu';
import NewGroupDialog from './NewGroupDialog';
import Folders from './Folders';
import FolderDialog from './FolderDialog';
import { pinata } from '@/pinata';
import LoaderDialog from './LoaderDialog';
import FileDialog from './FileDialog';
import { group } from 'console';
import AboutDialog from './AboutDialog';
import { useUser } from '@clerk/nextjs';
import { getLocalUserId } from '@/pages';
import GameDialog from './GameDialog';

export type ItemType = {
  id: string;
  name: string;
  cid?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  position: { x: number; y: number };
};

const Desktop = () => {
  const [createNewFolderDialog, setCreateNewFolderDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [visibleMenuId, setVisibleMenuId] = useState("");
  const [files, setFiles] = useState<ItemType[]>([]);
  const [filesInGroup, setFilesInGroup] = useState<ItemType[]>([]);
  const [folder, setFolder] = useState<ItemType | null>();
  const [file, setFile] = useState<ItemType | null>();
  const [groups, setGroups] = useState<ItemType[]>([]);
  const [helpWindowPosition, setHelpWindowPosition] = useState({ x: window.innerWidth - 500, y: 50 });
  const [loader, setLoader] = useState(false);
  const [draggedOverFolderId, setDraggedOverFolderId] = useState<string | null>(null);
  const [aboutDialog, setAboutDialog] = useState(false);
  const [gameDialog, setGameDialogOpen] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState("");

  const { user } = useUser();
  const fileRef: any = useRef();

  useEffect(() => {
    loadFiles();
    loadGroups();
  }, []);

  useEffect(() => {
    if(file) {
      setFolder(null);
    }
  }, [file]);

  useEffect(() => {
    //  @ts-ignore
    window.pinata = () => {
      setGameDialogOpen(true);
      console.log('Easter egg activated!');
    }

    // return () => {
    //   //  @ts-ignore
    //   delete window.pinata;
    // };
  }, [window]);

  const handleSelectFile = () => {
    fileRef?.current?.click()
  }

  const handleDragEnterFolder = (folderId: string) => {
    setDraggedOverFolderId(folderId);
    document.getElementById(folderId)?.classList.add("bg-[#eee]")
  };

  const handleDragLeaveFolder = (folderId: string) => {
    if (draggedOverFolderId === folderId) {
      setDraggedOverFolderId(null);
      document.getElementById(folderId)?.classList.remove("bg-[#eee]")
    }
  };

  const handleDragStart = (event: React.DragEvent, id: string | 'help') => {
    setDraggedFileId(id);
    const { clientX, clientY } = event;
    event.dataTransfer.setData("text/plain", JSON.stringify({ clientX, clientY, id }));
  };

  const handleDrop = async (event: any) => {
    event.preventDefault();
    if(folder) {
      setDraggedFileId("");
      return;
    }
    const files = [];
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      if (event.dataTransfer.items[i].kind === 'file') {
        const file = event.dataTransfer.items[i].getAsFile();
        files.push(file);
      }
    }
    if (files.length > 0) {
        setLoader(true)
        await handleUpload(files[0])
        loadFiles();
        setLoader(false);
        setDraggedFileId("");
        return;
    }

    if (draggedOverFolderId) {
      // Here you can handle the file upload to this specific folder
      await handleAddToFolder(draggedFileId, draggedOverFolderId);
      setDraggedFileId("");
      document.getElementById(draggedOverFolderId)?.classList.remove("bg-[#eee]")
      return;
    }

    const { clientX, clientY } = event;
    const { clientX: startX, clientY: startY, id } = JSON.parse(event.dataTransfer.getData("text"));

    if (id === 'help') {
      const newX = clientX - startX + helpWindowPosition.x;
      const newY = clientY - startY + helpWindowPosition.y;
      setHelpWindowPosition({ x: newX, y: newY });
    } else {
      setFiles((prevFiles) =>
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

      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === id) {
            const newPosition = {
              x: clientX - startX + group.position.x,
              y: clientY - startY + group.position.y,
            };

            localStorage.setItem(group.id, JSON.stringify(newPosition));

            return {
              ...group,
              position: newPosition,
            };
          }
          return group;
        })
      );
    }
  };

  const arrangeFiles = (by: string) => {
    let sortedItems = [...files]; // Assuming 'items' is an array containing all items
    if (by === 'name') {
      sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    } else if (by === 'size') {
      sortedItems.sort((a, b) => (a.size || 0) - (b.size || 0));
    }

    let filesData: ItemType[] = []
    sortedItems.forEach((f: any, index: number) => {
      filesData.push({
        id: f.id,
        name: f.name,
        cid: f.cid,
        mimeType: f.mime_type,
        size: f.size, 
        createdAt: f.created_at,
        position: getPosition(index, f)
      });
    });

    setFiles(filesData);
    filesData.forEach((f) => {
      localStorage.removeItem(f.id);
    })
  }

  const handleAddToFolder = async (fileId: string, folderId: string) => {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    await fetch(`/api/groups`, {
      method: "PUT", 
      headers: headers, 
      body: JSON.stringify({
        fileId, 
        folderId
      })
    })

    loadFiles();
  }

  const createNewGroup = async () => {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    await fetch("/api/groups", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        groupName: groupName
      })
    });
    setGroupName("");
    setCreateNewFolderDialog(false);
    loadGroups();
  };

  const deleteFolder = async (id: string) => {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    await fetch(`/api/groups?groupId=${id}`, {
      method: "DELETE", 
      headers
    })
    loadGroups()
  }

  const deleteFile = async (id: string) => {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    await fetch(`/api/files/${id}`, {
      method: "DELETE", 
      headers
    })

    if(folder) {
      loadFiles(folder.id)
    } else {
      loadFiles()
    }
  }

  const getPosition = (index: number, item: any) => {
    //  Get position from localstorage
    const localPosition = localStorage.getItem(item.id)
    if (localPosition) {
      return JSON.parse(localPosition);
    }
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const itemsPerRow = Math.floor(windowWidth / 150);
    const spacingX = 150;
    const spacingY = 100;

    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const x = col * spacingX + 50;
    const y = row * spacingY + 50;
    return { x, y }
  }

  const loadGroups = async () => {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    const groupsRes = await fetch("/api/groups", { headers });
    const data = await groupsRes.json();
    const groupsToUse = data.data;

    let groupData: ItemType[] = [];
    groupsToUse.forEach((g: any, index: number) => {
      groupData.push({
        id: g.id,
        name: g.name.split("+")[1],
        position: getPosition(index, g)
      });
    });

    setGroups(groupData);
  };

  const loadFiles = async (groupId?: string) => {
    let url = `/api/files`
    if (groupId) {
      url = url + `?groupId=${groupId}`
    }

    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }

    const filesRes = await fetch(url, { headers });
    const data = await filesRes.json();
    const filesToUse = data.data;

    let filesData: ItemType[] = [];
    filesToUse.forEach((f: any, index: number) => {
      filesData.push({
        id: f.id,
        name: f.name,
        cid: f.cid,
        mimeType: f.mime_type,
        size: f.size,
        createdAt: f.created_at,
        position: getPosition(index, f)
      });
    });

    if (groupId) {
      setFilesInGroup(filesData)
    } else {
      setFiles(filesData);      
    }
  };

  const uploadFile = async (e: any, groupId?: string) => {    
    try {
      setLoader(true);
      const file = e.target.files[0];

      if(groupId || folder) {
        const id = groupId ? groupId : folder?.id;
        await handleUpload(file, id);
        loadFiles(id);
      } else {
        await handleUpload(file);
        loadFiles();
      }
      setLoader(false);
      
    } catch (error) {
      console.log(error)
      setLoader(false);
      alert("Trouble adding file")
    }
  }

  const handleUpload = async (fileData: any, groupId?: string) => {
    try {
      let headers: any = {
        'Content-Type': 'application/json'
      }
      if(!user?.id) {
        headers.authorization = `Bearer ${getLocalUserId()}`
      }
      const keyRes = await fetch("/api/files", {
        method: "POST", 
        headers 
      })

      const keyData = await keyRes.json()
      const key = keyData.data;
      // Upload from the client
      if(groupId) {
        await pinata.upload.file(fileData).addMetadata({ name: `${user?.id}+${fileData.name}`, keyvalues: {
          userId: user?.id || getLocalUserId() || "", 
          testUser: user?.id ? "false" : "true"
        } }).group(groupId).key(key)
      } else {
        await pinata.upload.file(fileData).addMetadata({ name: `${user?.id}+${fileData.name}`, keyvalues: {
          userId: user?.id || getLocalUserId() || "", 
          testUser: user?.id ? "false" : "true"
        } }).key(key)
      }
    } catch (error) {
      throw error;
    }
  }

  const updateFileName = async (file: ItemType, newName: string, groupId?: string) => {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    await fetch(`/api/files/${file.id}`, {
      method: "PUT", 
      headers: headers, 
      body: JSON.stringify({
        newName: newName
      })
    })

    if(groupId || folder) {
      const id = groupId ? groupId : folder?.id;
      loadFiles(id);
    } else {
      loadFiles();
    }
  }

  return (
    <>
      <Menu setAboutDialog={setAboutDialog} arrangeFiles={arrangeFiles} folder={folder} handleSelectFile={handleSelectFile} newFolder={() => setCreateNewFolderDialog(true)} />
      <input type="file" className="hidden" ref={fileRef} onChange={uploadFile} />
      <div onClick={() => setVisibleMenuId("")} className="w-full h-screen relative" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <HelpWindow
          handleDragStart={(e: any) => handleDragStart(e, 'help')}
          style={{ left: `${helpWindowPosition.x}px`, top: `${helpWindowPosition.y}px` }}
        />
        <Files updateFileName={updateFileName} deleteFile={deleteFile} setFile={setFile} visibleMenuId={visibleMenuId} setVisibleMenuId={setVisibleMenuId} handleDragStart={handleDragStart} files={files} />
        <Folders handleDragEnterFolder={handleDragEnterFolder} handleDragLeaveFolder={handleDragLeaveFolder} setFolder={setFolder} visibleMenuId={visibleMenuId} setVisibleMenuId={setVisibleMenuId} deleteFolder={deleteFolder} handleDragStart={handleDragStart} folders={groups} />
        {createNewFolderDialog &&
          <NewGroupDialog createNewGroup={createNewGroup} groupName={groupName} setGroupName={setGroupName} setCreateNewFolderDialog={setCreateNewFolderDialog} />
        }
        {
          folder &&
          <FolderDialog updateFileName={updateFileName} setFile={setFile} visibleMenuId={visibleMenuId} setVisibleMenuId={setVisibleMenuId} handleDragStart={handleDragStart} deleteFile={deleteFile} filesInGroup={filesInGroup} item={folder} setItem={setFolder} setFilesInGroup={setFilesInGroup} handleUpload={handleUpload} loadFiles={loadFiles} />
        }
        {
          file &&
          <FileDialog item={file} setItem={setFile} />
        }
        {
          loader &&
          <LoaderDialog />
        }
        {
          aboutDialog &&
          <AboutDialog setAboutDialog={setAboutDialog} />
        }
        {
          gameDialog && 
          <GameDialog setGameDialogOpen={setGameDialogOpen} />
        }
      </div>
    </>
  );
};

export default Desktop;