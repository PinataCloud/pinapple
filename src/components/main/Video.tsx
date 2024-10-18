import React from 'react'

type VideoProps = {
  url: string;
  mimeType: string;
}
const Video = (props: VideoProps) => {
  const { url, mimeType } = props;
  return (
    <video controls width="100%">
      <source className="w-full" src={url} type={mimeType} />     
    </video>
  )
}

export default Video