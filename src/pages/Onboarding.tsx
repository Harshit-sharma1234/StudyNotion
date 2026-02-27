// @ts-nocheck
import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Tab from "../components/Common/Tab";
import { ACCOUNT_TYPE } from "../utils/constants";
import HighlightText from "../components/core/HomePage/HighlightText";

const Onboarding = () => {
    const { user, isLoaded } = useUser();
    const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const tabData = [
        {
            id: 1,
            tabName: "Student",
            type: ACCOUNT_TYPE.STUDENT,
        },
        {
            id: 2,
            tabName: "Instructor",
            type: ACCOUNT_TYPE.INSTRUCTOR,
        },
    ];

    const handleOnboarding = async () => {
        setLoading(true);
        try {
            await user.update({
                unsafeMetadata: {
                    accountType: accountType,
                },
            });
            // Redirect to dashboard after updating metadata
            navigate("/dashboard/my-profile");
        } catch (error) {
            console.error("Error updating account type:", error);
        }
        setLoading(false);
    };

    if (!isLoaded) return null;

    return (
        <div className="flex min-h-[calc(100-3.5rem)] w-full items-center justify-center bg-richblack-900 text-white">
            <div className="flex w-11/12 max-w-[450px] flex-col gap-y-4 p-8">
                <h1 className="text-4xl font-semibold text-richblack-5">
                    Welcome! Let's get <HighlightText text={"Started"} />
                </h1>
                <p className="text-lg text-richblack-300">
                    How would you like to use StudyNotion? Choose your role to continue.
                </p>

                <Tab tabData={tabData} field={accountType} setField={setAccountType} />

                <button
                    onClick={handleOnboarding}
                    disabled={loading}
                    className="mt-6 rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 transition-all duration-200 hover:scale-95 disabled:opacity-50"
                >
                    {loading ? "Setting Up..." : "Continue"}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
