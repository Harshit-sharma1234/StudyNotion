// @ts-nocheck
import React from 'react'
import CTAButton from "../../../components/core/HomePage/Button";
import { FaArrowRight } from "react-icons/fa";
import Instructor from "../../../assets/Images/Instructor.png";
import HighlightText from './HighlightText';
import { SignUpButton, SignedIn, SignedOut } from "@clerk/clerk-react";

const InstructorSection = () => {
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-20 items-center">
        <div className="lg:w-[50%]">
          <img
            src={Instructor}
            alt=""
            className="shadow-white shadow-[-20px_-20px_0_0]"
          />
        </div>
        <div className="lg:w-[50%] flex gap-10 flex-col">
          <h1 className="lg:w-[50%] text-4xl font-semibold ">
            Become an
            <HighlightText text={"instructor"} />
          </h1>

          <p className="font-medium text-[16px] text-justify w-[90%] text-richblack-300">
            Instructors from around the world teach millions of students on
            StudyNotion. We provide the tools and skills to teach what you
            love.
          </p>

          <div className="w-fit">
            <SignedOut>
              <SignUpButton mode="modal">
                <div className="cursor-pointer">
                  <CTAButton active={true} linkto={"#"}>
                    <div className="flex items-center gap-3">
                      Start Teaching Today
                      <FaArrowRight />
                    </div>
                  </CTAButton>
                </div>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <CTAButton active={true} linkto={"/dashboard/my-profile"}>
                <div className="flex items-center gap-3">
                  Go to Dashboard
                  <FaArrowRight />
                </div>
              </CTAButton>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorSection
