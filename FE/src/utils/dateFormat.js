import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/vi";

dayjs.locale("vi");
dayjs.extend(localeData);

// Extend dayjs with the weekday plugin
dayjs.extend(weekday);

// Function to format dates for display
export const formatDateDisplay = (date) =>
  dayjs(date).format("DD-MM-YYYY | HH:mm:ss");

// Function to format dates for API
export const formatDateForAPI = (date) =>
  dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
