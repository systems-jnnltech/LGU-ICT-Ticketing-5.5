const fs = require('fs');

let mappers = fs.readFileSync('src/lib/mappers.ts', 'utf-8');
mappers = mappers.replace(
  /comments: dbTicket.ticket_comments \? dbTicket.ticket_comments.map[\s\S]*? \}\);/,
  `comments: dbTicket.ticket_comments ? dbTicket.ticket_comments.map((c: any) => ({
    id: c.id,
    userId: c.author_id,
    text: c.content,
    createdAt: c.created_at
  })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [],
  actions: dbTicket.ticket_actions ? dbTicket.ticket_actions.map((a: any) => ({
    id: a.id,
    ticketId: a.ticket_id,
    actionNumber: a.action_number,
    performedBy: a.performed_by,
    actionTaken: a.action_taken,
    recommendation: a.recommendation,
    createdAt: a.created_at
  })).sort((a: any, b: any) => a.actionNumber - b.actionNumber) : [],
  confirmations: dbTicket.ticket_confirmations ? dbTicket.ticket_confirmations.map((c: any) => ({
    id: c.id,
    ticketId: c.ticket_id,
    attemptNumber: c.attempt_number,
    confirmedBy: c.confirmed_by,
    result: c.result,
    feedback: c.feedback,
    createdAt: c.created_at
  })).sort((a: any, b: any) => a.attemptNumber - b.attemptNumber) : [],
  referral: dbTicket.external_referrals && dbTicket.external_referrals.length > 0 ? {
    id: dbTicket.external_referrals[0].id,
    ticketId: dbTicket.external_referrals[0].ticket_id,
    referredBy: dbTicket.external_referrals[0].referred_by,
    reason: dbTicket.external_referrals[0].reason,
    serviceProvider: dbTicket.external_referrals[0].service_provider,
    contactPerson: dbTicket.external_referrals[0].contact_person,
    contactNumber: dbTicket.external_referrals[0].contact_number,
    referenceNumber: dbTicket.external_referrals[0].reference_number,
    dateReferred: dbTicket.external_referrals[0].date_referred,
    expectedReturnDate: dbTicket.external_referrals[0].expected_return_date,
    estimatedCost: dbTicket.external_referrals[0].estimated_cost,
    notes: dbTicket.external_referrals[0].notes,
    createdAt: dbTicket.external_referrals[0].created_at
  } : undefined
});`
);
fs.writeFileSync('src/lib/mappers.ts', mappers);

let context = fs.readFileSync('src/store/AppContext.tsx', 'utf-8');
context = context.replace(
  /supabase\.from\('tickets'\)\.select\('\*, ticket_comments\(\*\)'\)/,
  "supabase.from('tickets').select('*, ticket_comments(*), ticket_actions(*), ticket_confirmations(*), external_referrals(*)')"
);

// We also need to add realtime subscriptions for the new tables if we want instant updates,
// or we can just rely on the existing tickets-changes channel if we update the ticket status/updatedAt
fs.writeFileSync('src/store/AppContext.tsx', context);
