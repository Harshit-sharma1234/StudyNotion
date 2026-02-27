// @ts-nocheck
import React from "react";
import { RiEditBoxLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../Common/IconBtn"
import RoleBadge from "./MyProfile/RoleBadge";
import Skeleton from "../../Common/Skeleton";

// Define the shape of the user state for type safety
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  accountType: string;
  additionalDetails: {
    about?: string;
    gender?: string;
    contactNumber?: string;
    dateOfBirth?: string;
  };
}

interface RootState {
  profile: {
    user: UserProfile | null;
    loading: boolean;
  };
}

export default function MyProfile() {
  const { user, loading } = useSelector((state: RootState) => state.profile)
  const navigate = useNavigate()

  // Industry-grade Skeleton Loader for the Profile Page
  if (loading) {
    return (
      <div className="flex flex-col gap-y-10">
        <Skeleton variant="text" width={200} height={40} className="mb-4" />
        <div className="flex items-center justify-between rounded-2xl border border-richblack-700 bg-richblack-800/50 p-8 px-12 backdrop-blur-sm">
          <div className="flex items-center gap-x-4">
            <Skeleton variant="circular" width={78} height={78} />
            <div className="space-y-2">
              <Skeleton variant="text" width={150} height={24} />
              <Skeleton variant="text" width={200} height={18} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-6 rounded-2xl border border-richblack-700 bg-richblack-800/50 p-8 px-12 backdrop-blur-sm">
          <Skeleton variant="text" width={100} height={24} />
          <Skeleton variant="rectangular" height={60} />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-14 flex items-center justify-between">
        <h1 className="text-3xl font-medium text-richblack-5">My Profile</h1>
        <RoleBadge role={user?.accountType} />
      </div>

      {/* Section 1: Header */}
      <div className="group relative flex items-center justify-between rounded-2xl border border-richblack-700 bg-richblack-800/40 p-8 px-12 backdrop-blur-xl transition-all duration-300 hover:bg-richblack-800/60">
        <div className="flex items-center gap-x-4">
          <div className="relative">
            <img
              src={user?.image}
              alt={`profile-${user?.firstName}`}
              className="aspect-square w-[78px] rounded-full border-2 border-yellow-50 object-cover shadow-lg shadow-yellow-50/10"
            />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-richblack-800 bg-caribbeangreen-200"></div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-richblack-5">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="text-sm font-medium text-richblack-300">{user?.email}</p>
          </div>
        </div>
        <IconBtn
          text="Edit"
          onclick={() => navigate("/dashboard/settings")}
          customClasses="group-hover:scale-105 transition-transform duration-200"
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>

      {/* Section 2: About */}
      <div className="group my-10 flex flex-col gap-y-6 rounded-2xl border border-richblack-700 bg-richblack-800/40 p-8 px-12 backdrop-blur-xl transition-all duration-300 hover:bg-richblack-800/60">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-5">About</p>
          <IconBtn
            text="Edit"
            onclick={() => navigate("/dashboard/settings")}
            customClasses="group-hover:scale-105 transition-transform duration-200"
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <p
          className={`${user?.additionalDetails?.about
              ? "text-richblack-100"
              : "text-richblack-400 italic"
            } text-sm leading-relaxed`}
        >
          {user?.additionalDetails?.about ?? "Tell the world about yourself..."}
        </p>
      </div>

      {/* Section 3: Personal Details */}
      <div className="group flex flex-col gap-y-10 rounded-2xl border border-richblack-700 bg-richblack-800/40 p-8 px-12 backdrop-blur-xl transition-all duration-300 hover:bg-richblack-800/60">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-5">Personal Details</p>
          <IconBtn
            text="Edit"
            onclick={() => navigate("/dashboard/settings")}
            customClasses="group-hover:scale-105 transition-transform duration-200"
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="space-y-6">
            <DetailItem label="First Name" value={user?.firstName} />
            <DetailItem label="Email" value={user?.email} />
            <DetailItem label="Gender" value={user?.additionalDetails?.gender ?? "Add Gender"} isPlaceholder={!user?.additionalDetails?.gender} />
          </div>
          <div className="space-y-6">
            <DetailItem label="Last Name" value={user?.lastName} />
            <DetailItem label="Phone Number" value={user?.additionalDetails?.contactNumber ?? "Add Contact Number"} isPlaceholder={!user?.additionalDetails?.contactNumber} />
            <DetailItem label="Date Of Birth" value={formattedDate(user?.additionalDetails?.dateOfBirth) ?? "Add Date Of Birth"} isPlaceholder={!user?.additionalDetails?.dateOfBirth} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-component for individual detail items to keep code clean
const DetailItem = ({ label, value, isPlaceholder = false }: { label: string, value?: string, isPlaceholder?: boolean }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-widest text-richblack-500">{label}</p>
    <p className={`text-sm font-medium ${isPlaceholder ? "text-richblack-400 italic" : "text-richblack-5"}`}>
      {value}
    </p>
  </div>
);
