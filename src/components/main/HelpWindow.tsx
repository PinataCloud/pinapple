import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react';

type HelpWindowProps = {
  handleDragStart: Function;
  style?: React.CSSProperties;
};

const HelpWindow = (props: HelpWindowProps) => {
  const { handleDragStart, style } = props;
  const [windowOpen, setWindowOpen] = useState(true);

  const { user } = useUser();

  return (
    <>
      {windowOpen ? (
        <div
          onDragStart={(e) => handleDragStart(e, null)}
          draggable="true"
          className="window right-4 top-12 fixed max-w-[40%] z-40"
          style={style}
        >
          <div className="title-bar">
            <button
              aria-label="Close"
              className="close"
              onClick={() => setWindowOpen(false)}
            ></button>
            <h1 className="title">Help</h1>            
          </div>
          <div className="separator"></div>

          <div className="window-pane">
            {!user?.id && 
              <><p>You are using this machine as a guest user. All file will be deleted every six hours.</p><br /></>
            }
            <p>To add files, drag them onto the desktop or open a folder and drag
            them into the folder.</p><br />
            <p>Currently, you can only have one level of folders, no nesting.</p><br />
            <p>Files and folders are all draggable. Double click to open any item. Right-click for more options.</p><br />
            <p>Images and videos can be viewed inline. Everything else will be downloaded.</p>
          </div>
        </div>
      ) : (
        <div className="window fixed right-4 bottom-12 scale-down z-40">
          <div className="title-bar">
            <h1 className="title">Help</h1>
            <button
              aria-label="Resize"
              className="resize"
              onClick={() => setWindowOpen(true)}
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpWindow;