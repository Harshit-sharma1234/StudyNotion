import React from "react";
import { ACCOUNT_TYPE } from "../../../../utils/constants";
import { PiStudentFill, PiChalkboardTeacherFill } from "react-icons/pi";

interface RoleBadgeProps {
    role: string | undefined;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
    if (!role) return null;

    const isInstructor = role === ACCOUNT_TYPE.INSTRUCTOR;

    return (
        <div
            className={`flex w-fit items-center gap-x-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isInstructor
                    ? "bg-yellow-800/20 text-yellow-50 border border-yellow-800/50"
                    : "bg-blue-800/20 text-blue-100 border border-blue-800/50"
                }`}
        >
            {isInstructor ? (
                <PiChalkboardTeacherFill className="text-sm" />
            ) : (
                <PiStudentFill className="text-sm" />
            )}
            {role}
        </div>
    );
};

export default RoleBadge;
