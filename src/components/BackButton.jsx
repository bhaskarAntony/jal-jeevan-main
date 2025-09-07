import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

function BackButton({link}) {
  return (
    <Link to={link} className="p-3 hover:bg-gray-100 rounded-xl transition-all">
        <ArrowLeft/>
    </Link>
  )
}

export default BackButton