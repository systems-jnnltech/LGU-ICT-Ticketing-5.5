import { differenceInMinutes, parseISO } from 'date-fns';

export const SLA_HOURS: Record<string, number> = {
  'Critical': 24,
  'High': 72,
  'Medium': 120,
  'Low': 168,
};

export function getTicketSLA(ticket: any) {
  const isClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  
  const createdDate = typeof ticket.createdAt === 'string' ? parseISO(ticket.createdAt) : ticket.createdAt;
  const now = new Date();
  
  let timeSpentMin = 0;
  if (isClosed) {
    const resolvedHistory = ticket.statusHistory?.find((h: any) => h.status === 'RESOLVED' || h.status === 'CLOSED');
    let resolvedDate = typeof ticket.updatedAt === 'string' ? parseISO(ticket.updatedAt) : ticket.updatedAt;
    if (resolvedHistory) {
      resolvedDate = typeof resolvedHistory.timestamp === 'string' ? parseISO(resolvedHistory.timestamp) : resolvedHistory.timestamp;
    }
    timeSpentMin = differenceInMinutes(resolvedDate, createdDate);
  } else {
    timeSpentMin = differenceInMinutes(now, createdDate);
  }

  const slaHours = SLA_HOURS[ticket.priority] || 24;
  const slaMin = slaHours * 60;
  
  const remainingMin = slaMin - timeSpentMin;
  const isBreached = remainingMin < 0;
  
  let label = '';
  if (isClosed) {
    label = isBreached ? 'SLA Breached' : 'SLA Met';
  } else {
    if (isBreached) {
      const overHours = Math.floor(Math.abs(remainingMin) / 60);
      const overMins = Math.abs(remainingMin) % 60;
      label = `Breached by ${overHours}h ${overMins}m`;
    } else {
      const remHours = Math.floor(remainingMin / 60);
      const remMins = remainingMin % 60;
      label = `${remHours}h ${remMins}m left`;
    }
  }

  return {
    isBreached,
    isClosed,
    label,
    remainingMin
  };
}
