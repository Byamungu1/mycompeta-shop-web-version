import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

/**
 * Calculates the relative time label based on a given date string/timestamp.
 */
const getRelativeLabel = (dateValue: string) => {
  if (!dateValue) return 'Unknown Date';
  
  const now = dayjs();
  const date = dayjs(dateValue);
  
  const diffInDays = now.diff(date, 'day');
  const diffInWeeks = now.diff(date, 'week');
  const diffInMonths = now.diff(date, 'month');

  // 1. Today
  if (diffInDays === 0 && date.isSame(now, 'day')) {
    return 'Today';
  }
  
  // 2. Yesterday
  if (diffInDays === 1 || (diffInDays === 0 && !date.isSame(now, 'day'))) {
    return 'Yesterday';
  }

  // 3. Under 7 days
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  // 4. Weeks
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
  }

  // 5. Months
  return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
};

/**
 * Custom hook to group any flat list of data into React Native SectionList format.
 * 
 * @param {Array} dataList - The array of objects (e.g., notifications, orders).
 * @param {Function} dateExtractor - Callback to retrieve the date value (defaults to item.created_at).
 * @returns {Array} sections - Array formatted for SectionList: [{ title: 'Today', data: [...] }]
 * @returns {Function} recalculate - Trigger to force-recompute time labels manually.
 */
export const useGroupedByDate = (dataList, dateExtractor = (item: Notification) => item.created_at) => {
  // We use a simple tick state to force-trigger the useMemo whenever recalculate() is called
  const [tick, setTick] = useState(0);

  const recalculate = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  const sections = useMemo(() => {
    if (!dataList || dataList.length === 0) return [];

    // 1. Create relative grouping dynamically
    const groups = dataList.reduce((acc, item) => {
      const dateValue = dateExtractor(item);
      const titleLabel = getRelativeLabel(dateValue); // Assigns Today, Yesterday, etc.
      
      if (!acc[titleLabel]) {
        acc[titleLabel] = [];
      }
      acc[titleLabel].push(item);
      return acc;
    }, {});

    // 2. Format specifically for React Native SectionList
    return Object.keys(groups).map((title) => ({
      title, // This becomes 'Today', 'Yesterday', etc.
      data: groups[title],
    }));
  }, [dataList, dateExtractor, tick]); // Recalculates when data changes OR when tick increments

  return [sections, recalculate];
};