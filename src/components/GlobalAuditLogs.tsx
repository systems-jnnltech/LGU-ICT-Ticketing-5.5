import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { format, parseISO } from 'date-fns';
import { Activity, Ticket, Monitor, User, Clock } from 'lucide-react';

export function GlobalAuditLogs() {
  const { tickets, assets, users, currentUser } = useAppContext();

  const logs = useMemo(() => {
    let allLogs: any[] = [];

    // Ticket creations
    tickets.forEach(ticket => {
      allLogs.push({
        id: `ticket-create-${ticket.id}`,
        timestamp: ticket.createdAt,
        type: 'TICKET_CREATED',
        icon: Ticket,
        description: `Ticket ${ticket.ticketNumber} was created: "${ticket.subject}"`,
        userId: ticket.requesterId,
        color: 'text-emerald-500'
      });

      // Ticket history
      if (ticket.statusHistory) {
        ticket.statusHistory.forEach((sh, idx) => {
          allLogs.push({
            id: `ticket-status-${ticket.id}-${idx}`,
            timestamp: sh.timestamp,
            type: 'TICKET_STATUS',
            icon: Activity,
            description: `Ticket ${ticket.ticketNumber} status changed to ${sh.status}`,
            userId: null,
            color: 'text-amber-500'
          });
        });
      }

      // Ticket comments
      if (ticket.comments) {
        ticket.comments.forEach(c => {
          allLogs.push({
            id: `ticket-comment-${c.id}`,
            timestamp: c.createdAt,
            type: 'TICKET_COMMENT',
            icon: Ticket,
            description: `Comment on Ticket ${ticket.ticketNumber}: "${c.text.length > 30 ? c.text.substring(0, 30) + '...' : c.text}"`,
            userId: c.userId,
            color: 'text-blue-500'
          });
        });
      }
    });

    // Asset history
    assets.forEach(asset => {
      allLogs.push({
        id: `asset-create-${asset.id}`,
        timestamp: asset.dateAcquired ? new Date(asset.dateAcquired).toISOString() : new Date().toISOString(),
        type: 'ASSET_CREATED',
        icon: Monitor,
        description: `Asset added: ${asset.propertyNumber} (${asset.equipmentType})`,
        userId: null,
        color: 'text-indigo-500'
      });

      if (asset.history) {
        asset.history.forEach(h => {
          allLogs.push({
            id: `asset-hist-${h.id}`,
            timestamp: h.createdAt || new Date().toISOString(),
            type: 'ASSET_HISTORY',
            icon: Activity,
            description: `Asset ${asset.propertyNumber} - ${h.action}${h.changes ? `: ${h.changes}` : ''}`,
            userId: h.performedBy,
            color: 'text-indigo-500'
          });
        });
      }
    });

    allLogs.sort((a, b) => {
      return parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime();
    });

    return allLogs;
  }, [tickets, assets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Global Audit Logs</h2>
          <p className="text-sm text-ink-muted mt-1">System-wide activity and event tracking.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-6 overflow-hidden">
        <div className="relative border-l border-border ml-3 space-y-6">
          {logs.slice(0, 100).map((log, index) => {
            const user = log.userId ? users.find(u => u.id === log.userId) : null;
            const Icon = log.icon;
            return (
              <div key={log.id} className="relative pl-6">
                <div className="absolute left-0 -translate-x-1/2 top-1 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-surface" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${log.color}`} />
                    <span className="text-sm font-semibold text-ink">{log.description}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-ink-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{format(parseISO(log.timestamp), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
                {user && (
                  <div className="flex items-center space-x-1.5 text-xs text-ink-muted mt-1">
                    <User className="w-3.5 h-3.5" />
                    <span>by {user.name}</span>
                  </div>
                )}
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-sm text-ink-muted py-8 text-center">No logs recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
