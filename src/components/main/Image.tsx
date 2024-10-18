import React from 'react'

type ImageProps = {
  url: string;
}
const Image = (props: ImageProps) => {
  const { url } = props;
  return (
    <div className="w-full">
      <img className="w-full" src={url} alt="Download" />
    </div>
  )
}

export default Image