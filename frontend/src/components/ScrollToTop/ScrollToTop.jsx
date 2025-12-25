import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    const scrollToTop = () => {
        // Use multiple methods to ensure scroll to absolute top
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
            window.scroll(0, 0);
        }
    };

    useEffect(() => {
        // Disable browser's automatic scroll restoration
        if (window.history.scrollRestoration) {
            window.history.scrollRestoration = 'manual';
        }
        
        // Scroll to top immediately when route changes
        scrollToTop();
        
        // Also try after render to catch any late updates
        const timeoutId = setTimeout(scrollToTop, 0);
        const rafId = requestAnimationFrame(scrollToTop);
        
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
        };
    }, [pathname]);

    // Also scroll to top on initial mount/page refresh
    useEffect(() => {
        if (window.history.scrollRestoration) {
            window.history.scrollRestoration = 'manual';
        }
        scrollToTop();
        const timeoutId = setTimeout(scrollToTop, 0);
        const rafId = requestAnimationFrame(scrollToTop);
        
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return null;
};

export default ScrollToTop;
