import React from "react";

interface TabData {
  id: number;
  tabName: string;
  type: string;
}

interface TabProps {
  tabData: TabData[];
  field: string;
  setField: (value: string) => void;
}

export default function Tab({ tabData, field, setField }: TabProps) {
  return (
    <div
      style={{
        boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
      }}
      className="flex bg-richblack-800 p-1 gap-x-1 my-6 rounded-full max-w-max"
    >
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setField(tab.type)}
          className={` ${field === tab.type
              ? "bg-richblack-900 text-richblack-5"
              : "bg-transparent text-richblack-200"
            } py-2 px-5 rounded-full transition-all duration-200 hover:bg-richblack-700/50`}
        >
          {tab?.tabName}
        </button>
      ))}
    </div>
  );
}
