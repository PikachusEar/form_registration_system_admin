// ExamSections.jsx

export const ExamSections = ({ sections = [], onChange}) => {
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
                    <div className="grid grid-cols-2 gap-4 bg-base-200">
                        <div
                            key={section.id}
                            className="p-3 rounded-lg flex items-start gap-3"
                        >
                            <span className="badge badge-sm mt-1">{index + 1}</span>
                            <p className="flex-1">{section.sectionName}</p>
                        </div>
                        <div className="p-3 rounded-lg flex items-center gap-3">
                            <input type="text" placeholder="Join Code" value={section.joinCode} className="input" onChange={onChange} />
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
};

export default ExamSections;