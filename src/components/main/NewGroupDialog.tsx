import React from 'react'

type NewGroupDialogProps = {
  createNewGroup: Function;
  setGroupName: Function;
  groupName: string;
  setCreateNewFolderDialog: Function;
}

const NewGroupDialog = (props: NewGroupDialogProps) => {
  const { createNewGroup, groupName, setGroupName, setCreateNewFolderDialog } = props;
  const closeDialog = () => {
    setGroupName("")
    setCreateNewFolderDialog(false);
  }
  return (
    <div className="absolute w-full m-auto flex justify-center z-50">
      <div className="window scale-down w-[30rem]">
        <div className="title-bar">
          <button aria-label="Close" onClick={() => closeDialog()} className="close"></button>
          <h1 className="title">New Folder</h1>
          <button aria-label="Resize" disabled className="hidden"></button>
        </div>
        <div className="separator"></div>

        <div className="modeless-dialog">
          <section className="field-row justify-start">
            <label htmlFor="text_find" className="modeless-text">Folder name:</label>
            <input value={groupName} onChange={(e:any) => setGroupName(e.target.value)} id="text_find" type="text" className="w-full" placeholder="" />
          </section>
          <section className="field-row justify-end">
            <button className="btn" onClick={() => closeDialog()}>Cancel</button>
            <button className="btn w-[95px]" onClick={() => createNewGroup()}>Create</button>
          </section>
        </div>
      </div>
    </div>
  )
}

export default NewGroupDialog