import React from 'react'

type GameDialogProps = {
  setGameDialogOpen: Function;
}

const GameDialog = (props: GameDialogProps) => {
  const { setGameDialogOpen } = props;
  return (
    <div className="flex justify-center items-center absolute z-50 bg-white w-full">
      <div className="window w-full h-screen">
        <div className="title-bar">
          <button aria-label="Close" onClick={() => setGameDialogOpen(false)} className="close"></button>
          <h1 className="title">Pinata On/Off</h1>
        </div>
        <div className="window-pane w-full h-full">
          <iframe className="w-full h-full" src="https://orange-implicit-leopon-508.mypinata.cloud/ipfs/QmV1zcqQqVvNodknHHnFPADG1iMGofG5TMr7b7MqRzWMdT" />
        </div>
      </div>
    </div>
  )
}

export default GameDialog