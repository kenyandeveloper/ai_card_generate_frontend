const FilterSort = ({
  subjects,
  categories,
  filter,
  setFilter,
  sortBy,
  setSortBy,
}) => {
  const difficultyLevels = [1, 2, 3, 4, 5];

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
        {/* Subject Filter */}
        <div className="col-span-2 md:col-span-3">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Subject
          </label>
          <select
            value={filter.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="col-span-2 md:col-span-3">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Category
          </label>
          <select
            value={filter.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Difficulty
          </label>
          <select
            value={filter.difficulty}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All</option>
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="title">Title</option>
            <option value="lastStudied">Last Studied</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>

        {/* Search */}
        <div className="col-span-2 md:col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Search
          </label>
          <input
            type="text"
            value={filter.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search..."
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-3 py-2 text-sm text-text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSort;
