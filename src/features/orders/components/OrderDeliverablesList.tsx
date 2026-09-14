"use client";

import React from "react";
import { FiDownload } from "react-icons/fi";
import { DeliverableFile } from "../types";

interface OrderDeliverablesListProps {
  files: DeliverableFile[];
  title?: string;
  subtitle?: string;
}

export const OrderDeliverablesList: React.FC<OrderDeliverablesListProps> = ({
  files,
  title = "Delivered Files",
  subtitle,
}) => {
  if (files.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center">
        <p className="text-xs sm:text-sm text-slate-400 italic">No deliverable attachments uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs"
          >
            <div className="min-w-0 pr-3">
              <p className="font-bold text-sm sm:text-[15px] text-slate-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                file size <span className="font-semibold text-slate-700">{file.size}</span>
              </p>
            </div>
            <a
              href={file.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="Download file"
            >
              <FiDownload className="text-base" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
