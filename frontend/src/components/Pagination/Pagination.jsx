import './Pagination.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // Logic to show pages with ellipses: 1 ... 4 5 [6] 7 8 ... 20
    const getPageNumbers = () => {
        const pages = [];
        const maxVisibleButtons = 7;

        if (totalPages <= maxVisibleButtons) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate window around current page
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if near the beginning
            if (currentPage <= 3) {
                start = 2;
                end = Math.min(4, totalPages - 1);
            }

            // Adjust if near the end
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3);
                end = totalPages - 1;
            }

            // Add ellipses before window if needed
            if (start > 2) {
                pages.push('ellipsis-start');
            }

            // Add pages in window
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipses after window if needed
            if (end < totalPages - 1) {
                pages.push('ellipsis-end');
            }

            // Always show last page
            pages.push(totalPages);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination">
            <button
                className="page-btn nav-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <FaChevronLeft /> Prev
            </button>

            {pages.map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                    return (
                        <span key={`ellipsis-${index}`} className="ellipsis">
                            ...
                        </span>
                    );
                }
                return (
                    <button
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                className="page-btn nav-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next <FaChevronRight />
            </button>

            <div className="page-info">
                Page {currentPage} of {totalPages}
            </div>
        </div>
    );
};

export default Pagination;
