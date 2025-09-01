// src/components/Study/useStudyData.js
import { useState, useEffect } from "react";
import { fetchDecks } from "../../utils/deckApi";

export default function useStudyData(decksPerPage) {
  const [decks, setDecks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDecksData = async (page) => {
    try {
      const token = localStorage.getItem("authToken");
      const { decks: fetchedDecks, pagination: fetchedPagination } =
        await fetchDecks(
          token,
          page, // Use the page parameter here
          decksPerPage
        );

      setDecks(Array.isArray(fetchedDecks) ? fetchedDecks : []);
      setPagination({
        currentPage: fetchedPagination.current_page,
        totalPages: fetchedPagination.total_pages,
        totalItems: fetchedPagination.total_items,
      });
    } catch (err) {
      setError(err);
      console.error("Error fetching decks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecksData(pagination.currentPage);
  }, [pagination.currentPage]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    setIsLoading(true);
  };

  return {
    decks,
    pagination,
    isLoading,
    error,
    handlePageChange,
    refreshData: fetchDecksData,
  };
}
