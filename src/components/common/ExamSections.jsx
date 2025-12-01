// ExamSections.jsx
import { useState } from 'react';

export const ExamSections = ({ sections = [], onSectionsChange, disabled = false }) => {
    if (!sections || sections.length === 0) {
        return (
            <div>
                <label className="label">
                    <span className="label-text font-semibold">Exam Sections</span>
                </label>
                <p className="text-base-content/60">No exam sections registered</p>
            </div>
        );
    }

    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    return (
        <div>
            <div className="space-y-2">
                {sortedSections.map((section, index) => (
                    <div
                        key={section.id}
                        className="p-3 bg-base-200 rounded-lg flex items-start gap-3"
                    >
                        <span className="badge badge-sm mt-1">{index + 1}</span>
                        <p className="flex-1">{section.sectionName}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamSections;