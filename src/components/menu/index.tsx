import { useAuth, useUser } from '@clerk/nextjs'
import React from 'react'
import { ItemType } from '../main';
import { LOCAL_TEST_USER } from '@/pages';

type MenuProps = {
  newFolder: Function;
  handleSelectFile: Function;
  folder: ItemType | null | undefined;
  arrangeFiles: Function;
  setAboutDialog: Function;
}
const Menu = (props: MenuProps) => {
  const { newFolder, handleSelectFile, folder, arrangeFiles, setAboutDialog } = props;
  const { signOut } = useAuth()
  const { user } = useUser();

  const signUserOut = () => {
    if(user?.id) {
      signOut()
    } else {
      localStorage.removeItem(LOCAL_TEST_USER)
      window.location.reload();
    }
  }
  return (
    <ul role="menu-bar">
      <li role="menu-item" tabIndex={0} aria-haspopup="true">
        <img src="/pineapple_favicon.png" alt="Pineapple" className="h-6 w-6" />
        <ul role="menu">
          <li role="menu-item"><a onClick={() => setAboutDialog(true)} href="#">About Pinapple</a></li>
        </ul>
      </li>
      <li role="menu-item" tabIndex={0} aria-haspopup="true">
        File
        <ul role="menu">
          <li role="menu-item"><a onClick={() => handleSelectFile()} href="#menu">New file {folder && "in folder"}</a></li>
          {!folder && <li role="menu-item"><a onClick={() => newFolder(true)} href="#menu">New folder</a></li>}
          <li role="menu-item" className="divider"></li>
          <li role="menu-item"><a onClick={() => signUserOut()} href="#">Sign out</a></li>
        </ul>
      </li>
      <li role="menu-item" tabIndex={0} aria-haspopup="true">
        Edit
        <ul role="menu">
          <li role="menu-item"><a onClick={() => arrangeFiles("size")} href="#">Arrange by size</a></li>
          <li role="menu-item"><a onClick={() => arrangeFiles("name")} href="#">Arrange by name</a></li>          
        </ul>
      </li>     
    </ul>
  )
}

export default Menu