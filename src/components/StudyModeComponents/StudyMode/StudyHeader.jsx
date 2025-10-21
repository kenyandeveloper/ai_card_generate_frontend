import { X } from "lucide-react";

const StudyHeader = ({ deck, handleExitStudy }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {deck?.title || "Study Session"}
        </h1>
        <p className="text-text-muted">
          Master your knowledge through active recall
        </p>
      </div>
      <button
        onClick={handleExitStudy}
        className="bg-danger hover:bg-danger-emphasis text-text-primary p-2 rounded-lg transition-colors"
        title="Exit Study Session"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StudyHeader;
