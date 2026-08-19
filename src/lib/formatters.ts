// Tỷ giá quy đổi cố định (1 USD = 25,000 VND)
export const EXCHANGE_RATE_VND_TO_USD = 25000;

/**
 * Hàm quy đổi VND sang USD và định dạng chuỗi hiển thị
 * Ví dụ: 150000 -> "$6.00"
 */
export const formatPriceUSD = (vndAmount: number): string => {
  const usdAmount = vndAmount / EXCHANGE_RATE_VND_TO_USD;
  return `$${usdAmount.toFixed(2)}`;
};

/**
 * Hàm quy đổi giá trị VND sang số thực USD (dùng để lọc / so sánh giá)
 * Ví dụ: 150000 -> 6
 */
export const convertVndToUsd = (vndAmount: number): number => {
  return vndAmount / EXCHANGE_RATE_VND_TO_USD;
};
