export const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'CAD': return 'C$';
    case 'INR': return '₹';
    case 'GBP': return '£';
    case 'AUD': return 'A$';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'CHF': return 'CHF';
    case 'NZD': return 'NZ$';
    case 'ZAR': return 'R';
    case 'BRL': return 'R$';
    case 'MXN': return '$';
    case 'SGD': return 'S$';
    case 'HKD': return 'HK$';
    case 'KRW': return '₩';
    case 'SEK': return 'kr';
    case 'NOK': return 'kr';
    case 'DKK': return 'kr';
    case 'PLN': return 'zł';
    case 'RUB': return '₽';
    case 'TRY': return '₺';
    case 'THB': return '฿';
    case 'IDR': return 'Rp';
    case 'MYR': return 'RM';
    case 'PHP': return '₱';
    case 'VND': return '₫';
    case 'EGP': return '£';
    case 'ARS': return '$';
    case 'CLP': return '$';
    case 'COP': return '$';
    case 'PEN': return 'S/.';
    case 'UYU': return '$U';
    default: return currency;
  }
};

export const currencyList = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
];

module.exports = { getCurrencySymbol, currencyList };