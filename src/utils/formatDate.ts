import dayjs from 'dayjs';

export const formatDate = (value: string) => {
   if (!value) return '';
   // Example Output: "Tuesday, 14 July at 08:40"
   return dayjs(value).format('dddd, DD MMMM [at] HH:mm');
}