import React, { useContext } from "react";
import { FaBook } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import { tokenContext } from "../../Context/TokenContext";

export default function Navbar() {
  const { token, logout } = useContext(tokenContext);

  return (
    <nav className="text-gray-600 text-2xl w-full z-20 top-0 start-0 border-none border-default">
      <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to="/"
          className="flex md:hover:text-blue-700 items-center space-x-3 rtl:space-x-reverse"
        >
          <FaBook />
          <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">
            Alex Library
          </span>
        </Link>

        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="M5 7h14M5 12h14M5 17h14" />
          </svg>
        </button>

        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-default rounded-base bg-neutral-secondary-soft md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-neutral-primary">
            {token ? (
              <>
                <li>
                  <NavLink
                    to="/"
                    className="block md:hover:text-blue-700 py-2 px-3 rounded md:text-fg-brand md:p-0"
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/books"
                    className="block md:hover:text-blue-700 py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                  >
                    Books
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/authors"
                    className="block md:hover:text-blue-700 py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                  >
                    Authors
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="block md:hover:text-blue-700 py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/register"
                    className="block md:hover:text-blue-700 py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                  >
                    Register
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className="block md:hover:text-blue-700 py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent"
                  >
                    Login
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
