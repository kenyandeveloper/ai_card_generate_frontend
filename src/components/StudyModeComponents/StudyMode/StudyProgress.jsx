const StudyProgress = ({ currentIndex, totalCards, progressPercentage }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-text-muted text-sm">Progress</span>
        <span className="text-text-muted text-sm">
          {currentIndex + 1} of {totalCards} cards
        </span>
      </div>
      <div className="w-full bg-surface-highlight rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default StudyProgress;
