import { ProgressSpinner } from 'primereact/progressspinner'
import React from 'react'

type Props = {}

export default function Loading({}: Props) {
  return (
    <div style={{position: 'absolute', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', opacity: 0.6}}>
      <ProgressSpinner />
    </div>
  //   <div className="absolute bg-white bg-opacity-60 z-10 h-full w-full flex items-center justify-center">
  //   <div className="flex items-center">
  //     <span className="text-3xl font-bold mr-4 text-gray-600">Loading</span>
  //     <svg className="animate-spin h-20 w-20 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
  //       viewBox="0 0 24 24">
  //       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  //       <path className="opacity-75" fill="currentColor"
  //         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
  //       </path>
  //     </svg>
  //   </div>
  // </div>
  )
}