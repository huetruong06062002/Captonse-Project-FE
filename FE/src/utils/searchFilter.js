// Hàm tiện ích loại bỏ dấu
export const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Hàm tiện ích để lọc tùy chọn trong Select
export const customFilterOption = (input, option) => {
  if (!option) {
    return false;
  }
  const normalizedInput = removeDiacritics(input.toLowerCase());

  // Kiểm tra và chuẩn hóa option.label nếu tồn tại
  const label = option.label
    ? removeDiacritics(option.label.toLowerCase())
    : "";

  // Kiểm tra và chuẩn hóa option.children nếu tồn tại
  const children = option.children
    ? removeDiacritics(option.children.toLowerCase())
    : "";

  // Kiểm tra nếu normalizedInput nằm trong either normalizedOption or normalizedLabel
  return label.includes(normalizedInput) || children.includes(normalizedInput);
};
