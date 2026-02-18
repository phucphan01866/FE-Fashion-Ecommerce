'use client';
import { useState, useEffect, useRef } from 'react';

export function useDragScroll() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let isDragging = false;
        let startX: number;
        let scrollLeft: number;
        let hasDragged = false; // 🔧 THÊM: Track nếu đã drag
        const DRAG_THRESHOLD = 5; // 🔧 THÊM: Ngưỡng pixel để coi là drag

        const startDragging = (e: MouseEvent | TouchEvent) => {
            isDragging = true;
            hasDragged = false; // 🔧 THÊM: Reset drag state
            element.style.cursor = 'grabbing';
            const clientX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
            startX = clientX - element.offsetLeft;
            scrollLeft = element.scrollLeft;
        };

        const stopDragging = () => {
            isDragging = false;
            element.style.cursor = 'grab';

            // 🔧 THÊM: Set data attribute để Product components biết có drag hay không
            if (hasDragged) {
                element.setAttribute('data-has-dragged', 'true');

                // 🔧 THÊM: Clear flag sau 100ms để không ảnh hưởng click tiếp theo
                setTimeout(() => {
                    element.removeAttribute('data-has-dragged');
                }, 100);
            }
        };

        const onMove = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            if (!isDragging) return;

            const clientX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
            const x = clientX - element.offsetLeft;
            const scroll = x - startX;

            // 🔧 THÊM: Kiểm tra nếu drag vượt ngưỡng
            if (Math.abs(scroll) > DRAG_THRESHOLD) {
                hasDragged = true;
            }

            element.scrollLeft = scrollLeft - scroll;
        };

        // 🔧 THÊM: Event listener để ngăn Link navigation
        const preventLinkClick = (e: MouseEvent) => {
            // Kiểm tra nếu click target là Link hoặc nằm trong Link
            const linkElement = (e.target as Element).closest('a');
            if (linkElement && element.hasAttribute('data-has-dragged')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚫 Link navigation prevented due to drag');
            }
        };

        // Mouse events
        element.addEventListener('mousedown', startDragging as EventListener);
        element.addEventListener('mousemove', onMove as EventListener);
        element.addEventListener('mouseup', stopDragging);
        element.addEventListener('mouseleave', stopDragging);
        element.addEventListener('click', preventLinkClick, true); // 🔧 THÊM: Capture phase để ngăn Link

        // Touch events
        element.addEventListener('touchstart', startDragging as EventListener);
        element.addEventListener('touchmove', onMove as EventListener);
        element.addEventListener('touchend', stopDragging);

        // Prevent text/image selection
        element.addEventListener('selectstart', (e) => e.preventDefault());
        element.style.cursor = 'grab';

        // Disable image dragging
        const images = element.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('draggable', 'false');
        });

        return () => {
            element.removeEventListener('mousedown', startDragging as EventListener);
            element.removeEventListener('mousemove', onMove as EventListener);
            element.removeEventListener('mouseup', stopDragging);
            element.removeEventListener('mouseleave', stopDragging);
            element.removeEventListener('click', preventLinkClick, true); // 🔧 THÊM: Cleanup
            element.removeEventListener('touchstart', startDragging as EventListener);
            element.removeEventListener('touchmove', onMove as EventListener);
            element.removeEventListener('touchend', stopDragging);
        };
    }, []);

    return ref;
}

export function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}   