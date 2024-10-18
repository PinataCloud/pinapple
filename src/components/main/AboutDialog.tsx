import React from 'react'

type AboutDialogProps = {
  setAboutDialog: Function;
}

const AboutDialog = (props: AboutDialogProps) => {
  const { setAboutDialog } = props;
  return (
    <div className="flex justify-center items-center absolute z-50 bg-white">
      <div className="window">
        <div className="title-bar">
          <button aria-label="Close" onClick={() => setAboutDialog(false)} className="close"></button>
          <h1 className="title">About</h1>
        </div>
        <div className="window-pane">
          <p className="text-center">Pinapple, Version 1.0.0</p>
          <p className="text-center">© {new Date().getFullYear()}<a className="ml-1" href="https://pinata.cloud">Pinata Techonologies, Inc</a></p>
        </div>
      </div>
    </div>
  )
}

export default AboutDialog