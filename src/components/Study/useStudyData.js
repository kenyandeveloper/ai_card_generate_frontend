// src/components/Study/useStudyData.js
import { useEffect, useMemo, useState } from "react";
import { useDecks } from "../../hooks/useDecks";

export default function useStudyData(decksPerPage) {
  const {
    decks: allDecks,
    pagination: cachedPagination,
    loading,
    error,
    refetch,
  } = useDecks();

  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = allDecks.length;
  const totalPages =
    totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / decksPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const decks = useMemo(() => {
    const start = (currentPage - 1) * decksPerPage;
    return allDecks.slice(start, start + decksPerPage);
  }, [allDecks, currentPage, decksPerPage]);

  const pagination = useMemo(
    () => ({
      currentPage,
      totalPages,
      totalItems,
      completedThisWeek: cachedPagination?.completedThisWeek ?? 0,
      dueCount: cachedPagination?.dueCount ?? 0,
    }),
    [currentPage, totalPages, totalItems, cachedPagination]
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return {
    decks,
    pagination,
    isLoading: loading,
    error,
    handlePageChange,
    refreshData: () => refetch(),
  };
}
