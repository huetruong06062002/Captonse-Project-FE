import React from "react";
import { DatePicker as AntDatePicker } from "antd";
import locale from "antd/es/date-picker/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { formatDateForAPI } from "@utils/dateFormat";

dayjs.locale("vi");

const { RangePicker } = AntDatePicker;

const DatePicker = ({
  onChange,
  value,
  format = "DD-MM-YYYY",
  showTime = false,
  picker = "date",
  range = false,
  ...props
}) => {
  const handleChange = (date) => {
    if (onChange) {
      if (range) {
        const formattedDates = date
          ? date.map((d) => (d ? formatDateForAPI(d, showTime) : null))
          : [null, null];
        onChange(date, formattedDates);
      } else {
        onChange(date, date ? formatDateForAPI(date, showTime) : null);
      }
    }
  };

  const sharedProps = {
    locale,
    format,
    ...props,
  };

  const formatValue = (val) => {
    if (!val) return null;
    if (dayjs.isDayjs(val)) return val;
    return dayjs(val);
  };

  if (range) {
    return (
      <RangePicker
        {...sharedProps}
        picker={picker}
        showTime={showTime}
        value={value ? value.map(formatValue) : null}
        onChange={handleChange}
      />
    );
  }

  return (
    <AntDatePicker
      {...sharedProps}
      picker={picker}
      showTime={showTime}
      value={formatValue(value)}
      onChange={handleChange}
    />
  );
};

export default DatePicker;
