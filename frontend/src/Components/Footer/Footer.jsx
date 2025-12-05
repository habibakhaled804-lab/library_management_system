import React from 'react'
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (

    <footer className="p-4 bg-white sm:p-6 dark:bg-gray-800">
      <div className="sm:flex sm:items-center sm:justify-between">
        <span className="text-2xl text-gray-500 sm:text-center">© 2025 <Link to={"/"} className="hover:underline md:hover:text-blue-700">Alex Library</Link>. All Rights Reserved.
        </span>
        <div className="flex text-2xl mt-4 space-x-6 sm:justify-center sm:mt-0">
          <Link to={"https://web.facebook.com/?_rdc=1&_rdr#"} className="text-gray-500 hover:text-blue-700 ">
            <FaFacebook />
          </Link>
          <Link to={"https://www.instagram.com/"} className="text-gray-500 hover:text-blue-700 ">
            <FaInstagram />
          </Link>
          <Link to={"https://x.com/"} className="text-gray-500 hover:text-blue-700 ">
            <FaTwitter />
          </Link>
          <Link to={"https://www.linkedin.com/"} className="text-gray-500 hover:text-blue-700 ">
            <FaLinkedin />
          </Link>
          <Link to={"https://github.com/"} className="text-gray-500 hover:text-blue-700 ">
            <FaGithub />
          </Link>
        </div>
      </div>
    </footer>
  )
}
