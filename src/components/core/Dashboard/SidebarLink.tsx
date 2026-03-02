// @ts-nocheck
import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"

interface SidebarLinkProps {
  link: {
    name: string;
    path: string;
  };
  iconName: string;
}

export default function SidebarLink({ link, iconName }: SidebarLinkProps) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const matchRoute = (route: string) => {
    return matchPath({ path: route }, location.pathname)
  }

  const active = matchRoute(link.path);

  return (
    <NavLink
      to={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative px-8 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${active
          ? "bg-yellow-800/10 text-yellow-50"
          : "bg-opacity-0 text-richblack-300 hover:bg-richblack-700/30 hover:text-richblack-100"
        }`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 transition-all duration-300 ${active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
          }`}
      ></span>
      <div className="flex items-center gap-x-3 transition-transform duration-200 hover:translate-x-1">
        {/* Icon Goes Here */}
        <Icon className={`text-lg ${active ? "animate-pulse" : ""}`} />
        <span className="tracking-wide">{link.name}</span>
      </div>
    </NavLink>
  )
}
