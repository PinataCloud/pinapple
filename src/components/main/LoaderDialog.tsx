import React, { useEffect } from 'react'
import { ItemType } from '.';

const LoaderDialog = () => {
  return (
    <div className="absolute w-full m-auto flex justify-center z-50">
      <div className="window scale-down w-[30rem]">
        <div className="title-bar">
          <h1 className="title">Please wait...</h1>
        </div>
        <div className="separator"></div>

        <div className="modeless-dialog">
          <div className="w-full max-w-xs mx-auto p-4">
            <div className="relative w-full h-4 bg-gray-300 border border-gray-600 rounded overflow-hidden">
              <div className="absolute h-full bg-gray-600 loading-bar"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoaderDialog