import React, { useEffect, useState } from 'react'
import { ItemType } from '.';
import mime from 'mime';
import Image from './Image';
import Video from './Video';
import { useUser } from '@clerk/nextjs';
import { getLocalUserId } from '@/pages';

type FileDialogProps = {
  item: ItemType | null;
  setItem: Function;
}

const FileDialog = (props: FileDialogProps) => {
  const { item, setItem } = props;
  const [url, setUrl] = useState("")
  const { user } = useUser();

  useEffect(() => {
    if (item) {
      loadFile()
    }
  }, [item]);

  const loadFile = async () => {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    const res = await fetch(`/api/url?cid=${item?.cid}`, { headers })
    const data = await res.json()
    const url = data.data;
    setUrl(url)

    // Check if the mimeType is not image or video
    if (!item?.mimeType?.includes("image") && !item?.mimeType?.includes("video")) {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;

      // Set the download attribute to suggest a filename
      link.download = item?.name!;

      // Append the link to the body, trigger the download, and remove the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };



  const closeDialog = () => {
    setUrl("")
    setItem(null)
  }

  return (
    <div className="absolute w-full m-auto flex justify-center z-50">
      <div className="window scale-down min-w-[30rem] min-h-[30rem]">
        <div className="title-bar">
          <button aria-label="Close" onClick={() => closeDialog()} className="close"></button>
          <h1 className="title">{item?.name.split("+")[1]}</h1>
          <button aria-label="Resize" disabled className="hidden"></button>
        </div>
        <div className="separator"></div>

        <div className="modeless-dialog">
          {
            url &&
              item?.mimeType?.includes("image") ?
              <Image url={url} /> :
              url && item?.mimeType?.includes("video") ?
                <Video url={url} mimeType={item.mimeType} /> : url ?
                  <div>

                  </div> :
                  <div>
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
          }
        </div>
      </div>
    </div>
  )
}

export default FileDialog