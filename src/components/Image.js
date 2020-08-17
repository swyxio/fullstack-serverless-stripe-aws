import React, { useState, useEffect } from "react"
import {Storage} from 'aws-amplify'
async function fetchImage(src, updateSrc) {
  if (src.startsWith('https://')) {
    updateSrc(src)
  } else {
    const image = await Storage.get(src)
    updateSrc(image)
  }
}

const Image = ({ src, ...props}) => {
  const [imageSrc, updateSrc] = useState(null)
  useEffect(() => {
    fetchImage(src, updateSrc)
  }, [])
  
  return imageSrc ? <img src={imageSrc} {...props} /> : null
}

export default Image
