export const formatDateFriendly = (dateInput) => {
  if (!dateInput) return 'N/A';
  let dateStr = '';
  if (dateInput instanceof Date) {
    dateStr = dateInput.toISOString().split('T')[0];
  } else if (typeof dateInput === 'string') {
    dateStr = dateInput.split('T')[0];
  } else {
    return 'N/A';
  }
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (monthIdx < 0 || monthIdx > 11 || isNaN(day) || isNaN(year)) {
    return 'N/A';
  }
  return `${day} ${months[monthIdx]} ${year}`;
};
