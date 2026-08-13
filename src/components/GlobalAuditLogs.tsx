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
          const cleanText = c.text.replace(/<!--[\s\S]*?-->/g, '').trim();
          allLogs.push({
            id: `ticket-comment-${c.id}`,
            timestamp: c.createdAt,
            type: 'TICKET_COMMENT',
            icon: Ticket,
            description: `Comment on Ticket ${ticket.ticketNumber}: "${cleanText.length > 30 ? cleanText.substring(0, 30) + '...' : cleanText}"`,
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
    });

    allLogs.sort((a, b) => {
      return parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime();
    });

    return allLogs;
  }, [tickets, assets]);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header Section */}
      <section className="flex flex-col justify-center items-start gap-2 mb-2">
        <h1 className="font-black text-[2.75rem] leading-none tracking-tighter text-ink">
          Global Audit Logs
        </h1>
        <p className="text-ink-muted text-sm font-medium tracking-wide">
          System-wide activity and event tracking.
        </p>
      </section>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-border bg-bg/50">
          <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-3">
            <div className="w-2 h-4 bg-accent rounded-[1px]"></div>
            Activity Timeline
          </h3>
        </div>
        
        {/* Timeline Content */}
        <div className="p-6 md:p-10">
          <div className="relative">
            {/* Structural Vertical Line */}
            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-border/50"></div>
            
            <div className="space-y-8">
              {logs.slice(0, 100).map((log, index) => {
                const user = log.userId ? users.find(u => u.id === log.userId) : null;
                const Icon = log.icon;
                return (
                  <div key={log.id} className="relative pl-16 group">
                    {/* Premium Node Icon */}
                    <div className="absolute left-0 top-0 w-[48px] h-[48px] flex items-center justify-center bg-bg border border-border rounded-xl shadow-sm group-hover:border-accent group-hover:shadow-md transition-all z-10">
                      <Icon className={`w-5 h-5 ${log.color}`} />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pt-1 gap-4">
                      <div>
                        <span className="text-[14px] font-bold text-ink leading-relaxed block">
                          {log.description}
                        </span>
                        {user && (
                          <div className="flex items-center space-x-2 text-[12px] font-medium text-ink-muted mt-2.5 bg-bg/50 inline-flex px-3 py-1.5 rounded-lg border border-border/50">
                            <User className="w-3.5 h-3.5" />
                            <span>{user.name}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Premium Timestamp Pill */}
                      <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-ink-muted bg-bg/50 px-4 py-2 rounded-xl border border-border whitespace-nowrap shrink-0 shadow-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{format(parseISO(log.timestamp), 'MMM d, yyyy • h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {logs.length === 0 && (
                <div className="text-sm font-medium text-ink-muted py-12 text-center bg-bg/50 rounded-xl border border-dashed border-border">
                  No system logs recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
