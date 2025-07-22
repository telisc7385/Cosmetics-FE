export const istTime = (input: string) => {
    if (!input) return '';
  
    // Parse the string "21/07/2025, 06:36AM"
    const [datePart, timePartRaw] = input.split(', ');
    const [day, month, year] = datePart.split('/').map(Number);
  
    // Extract hour and minute from timePart
    const timeMatch = timePartRaw.match(/(\d{1,2}):(\d{2})(AM|PM)/i);
    if (!timeMatch) return 'Invalid Time';
  
    let [_, hourStr, minuteStr, meridian] = timeMatch;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
  
    // Convert to 24-hour format
    if (meridian.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (meridian.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }
  
    // Create a UTC Date object
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  
    // Format in IST
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  