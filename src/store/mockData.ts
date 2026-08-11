export type Role = 'Department User' | 'Admin' | 'ICT Support';

export interface User {
  id: string;
  name: string;
  role: Role;
  officeId?: string;
  email: string;
}

export interface Office {
  id: string;
  name: string;
  acronym?: string;
  email?: string;
}

export interface Asset {
  id: string;
  assetCode?: string;
  officeId: string;
  equipmentType: string;
  propertyNumber: string;
  inventoryNumber: string;
  brand: string;
  model: string;
  serialNumber: string;
  assignedTo: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged' | 'For Repair' | 'Unserviceable';
  operationalStatus: 'Operational' | 'Under Maintenance' | 'Non-Operational' | 'For Replacement' | 'Retired' | 'Lost / Missing';
  hostname?: string;
  processor?: string;
  memory?: string;
  diskStorage?: string;
  operatingSystem?: string;
  microsoftOffice?: string;
  exactLocation?: string;
  acquisitionCost?: string;
  dateAcquired?: string;
  dateAudited?: string;
  auditedBy?: string;
  remarks?: string;
  history?: AssetHistory[];
}

export interface AssetHistory {
  id: string;
  assetId: string;
  action: string;
  changes: string;
  performedBy: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  requesterId: string;
  officeId: string;
  assetId?: string;
  categoryId: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  subject: string;
  description: string;
  status: 'NEW' | 'ASSIGNED' | 'IN PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED' | 'REFERRED';
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: { status: 'NEW' | 'ASSIGNED' | 'IN PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED' | 'REFERRED', timestamp: string }[];
  comments?: Comment[];
  ictRecommendation?: string;
  followUpCount?: number;
}

export let mockOffices: Office[] = [
  { id: 'off_1', name: "Mayor's Office Administrative Section", acronym: 'MO-Admin', email: 'mo_admin@malungon.gov.ph' },
  { id: 'off_2', name: 'Bureau of Fire Protection', acronym: 'BFP', email: 'fire@malungon.gov.ph' },
  { id: 'off_3', name: 'Bids and Awards Committee', acronym: 'BAC', email: 'bac@malungon.gov.ph' },
  { id: 'off_4', name: 'Bureau of Internal Revenue', acronym: 'BIR', email: 'bir@malungon.gov.ph' },
  { id: 'off_5', name: 'Civil Security Unit', acronym: 'CSU', email: 'csu@malungon.gov.ph' },
  { id: 'off_6', name: 'General Services Office', acronym: 'GSO', email: 'gso@malungon.gov.ph' },
  { id: 'off_7', name: 'Local Disaster Risk Reduction and Management Office', acronym: 'LDRRMO', email: 'ldrrmo@malungon.gov.ph' },
  { id: 'off_8', name: 'Liga ng mga Barangay', acronym: 'LB', email: 'liga@malungon.gov.ph' },
  { id: 'off_9', name: 'Local Youth Development Office', acronym: 'LYDO', email: 'lydo@malungon.gov.ph' },
  { id: 'off_10', name: 'Municipal Economic Enterprise Development Office', acronym: 'MEEDO', email: 'market@malungon.gov.ph' },
  { id: 'off_11', name: 'Municipal Environment and Natural Resources Office', acronym: 'MENRO', email: 'menro@malungon.gov.ph' },
  { id: 'off_12', name: 'Municipal Local Government Operations Office', acronym: 'MLGOO', email: 'mlgoo@malungon.gov.ph' },
  { id: 'off_13', name: 'Municipal Social Welfare and Development Office', acronym: 'MSWDO', email: 'mswdo@malungon.gov.ph' },
  { id: 'off_14', name: 'Municipal Accounting Office', acronym: 'ACCOUNTING', email: 'accounting@malungon.gov.ph' },
  { id: 'off_15', name: 'Office of the Municipal Agriculturist', acronym: 'OMAG', email: 'agri@malungon.gov.ph' },
  { id: 'off_16', name: "Municipal Assessor's Office", acronym: 'MASSO', email: 'assessor@malungon.gov.ph' },
  { id: 'off_17', name: 'Municipal Budget Office', acronym: 'MBO', email: 'budget@malungon.gov.ph' },
  { id: 'off_18', name: 'Municipal Civil Registrar Office', acronym: 'MCR', email: 'registrar@malungon.gov.ph' },
  { id: 'off_19', name: 'Municipal Cooperative Development Office', acronym: 'MCDO', email: 'coop@malungon.gov.ph' },
  { id: 'off_20', name: 'Municipal Engineering Office', acronym: 'MEO', email: 'engineer@malungon.gov.ph' },
  { id: 'off_21', name: 'Municipal Health Office', acronym: 'MHO', email: 'health@malungon.gov.ph' },
  { id: 'off_22', name: 'Municipal Information Office', acronym: 'MIO', email: 'info@malungon.gov.ph' },
  { id: 'off_23', name: "Municipal Treasurer's Office", acronym: 'MTO', email: 'treasurer@malungon.gov.ph' },
  { id: 'off_24', name: 'Municipal Tribal Council', acronym: 'MTC', email: 'tribal@malungon.gov.ph' },
  { id: 'off_25', name: 'Municipal Nutrition Office', acronym: 'MNO', email: 'nutrition@malungon.gov.ph' },
  { id: 'off_26', name: 'Office of the Mayor', acronym: 'OM', email: 'mayor@malungon.gov.ph' },
  { id: 'off_27', name: 'Office of the Vice Mayor', acronym: 'OVM', email: 'vicemayor@malungon.gov.ph' },
  { id: 'off_28', name: 'Business Permits and Licensing Office', acronym: 'BPLO', email: 'permits@malungon.gov.ph' },
  { id: 'off_29', name: 'Human Resource Management Office', acronym: 'HRMO', email: 'hr@malungon.gov.ph' },
  { id: 'off_30', name: 'Public Employment Service Office', acronym: 'PESO', email: 'peso@malungon.gov.ph' },
  { id: 'off_31', name: 'Municipal Planning and Development Office', acronym: 'MPDO', email: 'planning@malungon.gov.ph' },
  { id: 'off_32', name: 'Philippine National Police', acronym: 'PNP', email: 'pnp@malungon.gov.ph' },
  { id: 'off_33', name: 'Sangguniang Bayan', acronym: 'SB', email: 'sb@malungon.gov.ph' },
  { id: 'off_34', name: 'Municipal Tourism Office', acronym: 'MTO', email: 'tourism@malungon.gov.ph' },
  { id: 'off_35', name: 'Systems Administrator', acronym: 'SYSTEMS', email: 'systems@malungon.gov.ph' },
  { id: 'off_36', name: 'Web Administrator', acronym: 'WEBADMIN', email: 'webadmin@malungon.gov.ph' }
];

export function addOffice(name: string) {
  const newOffice: Office = {
    id: 'off_' + Math.random().toString(36).substr(2, 9),
    name
  };
  mockOffices = [...mockOffices, newOffice];
  return newOffice;
}

export function updateOffice(id: string, name: string) {
  mockOffices = mockOffices.map(o => o.id === id ? { ...o, name } : o);
}

export const mockUsers: User[] = [
  { id: 'usr_admin', name: 'System Admin', role: 'Admin', email: 'admin@lgu.gov.ph' },
  { id: 'usr_ict1', name: 'ICT Support 1', role: 'ICT Support', email: 'ict1@lgu.gov.ph' },
  { id: 'usr_ict2', name: 'ICT Support 2', role: 'ICT Support', email: 'ict2@lgu.gov.ph' },
  { id: 'usr_ict3', name: 'ICT Support 3', role: 'ICT Support', email: 'ict3@lgu.gov.ph' },
  { id: 'usr_ict4', name: 'ICT Support 4', role: 'ICT Support', email: 'ict4@lgu.gov.ph' },
  { id: 'usr_dept1', name: 'Juan Dela Cruz', role: 'Department User', officeId: 'off_1', email: 'juan@lgu.gov.ph' },
];

export const mockCategories = [
  { id: 'cat_hw', name: 'Hardware' },
  { id: 'cat_sw', name: 'Software' },
  { id: 'cat_net', name: 'Network' },
];

import { INITIAL_MUNICIPAL_ASSETS, convertRawToAsset } from '../data/initialAssets';

export let mockAssets: Asset[] = INITIAL_MUNICIPAL_ASSETS.map(raw => convertRawToAsset(raw, mockOffices));


export let mockTickets: Ticket[] = [
  {
    id: 'tkt_1',
    ticketNumber: 'ICT-2026-00001',
    requesterId: 'usr_dept1',
    officeId: 'off_1',
    assetId: 'ast_1',
    categoryId: 'cat_hw',
    priority: 'High',
    subject: 'Computer does not boot',
    description: 'When I turn on the computer, it just shows a black screen with a flashing cursor. It was working fine yesterday.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    statusHistory: [
      { status: 'NEW', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
    ]
  },
  {
    id: 'tkt_2',
    ticketNumber: 'ICT-2026-00002',
    requesterId: 'usr_dept1',
    officeId: 'off_1',
    categoryId: 'cat_net',
    priority: 'Medium',
    subject: 'Cannot connect to shared drive',
    description: 'The Z: drive is no longer accessible from my computer.',
    status: 'IN PROGRESS',
    assignedToId: 'usr_ict1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    statusHistory: [
      { status: 'NEW', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { status: 'ASSIGNED', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() },
      { status: 'IN PROGRESS', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }
    ]
  }
];

export function addTicket(ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'updatedAt'>) {
  const newTicket: Ticket = {
    ...ticket,
    id: 'tkt_' + Math.random().toString(36).substr(2, 9),
    ticketNumber: `ICT-2026-\${String(mockTickets.length + 1).padStart(5, '0')}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [{ status: 'NEW', timestamp: new Date().toISOString() }],
  };
  mockTickets = [newTicket, ...mockTickets];
  return newTicket;
}

export function updateTicketStatus(ticketId: string, status: Ticket['status'], assignedToId?: string) {
  mockTickets = mockTickets.map(t => {
    if (t.id === ticketId) {
      const timestamp = new Date().toISOString();
      return {
        ...t,
        status,
        ...(assignedToId ? { assignedToId } : {}),
        updatedAt: timestamp,
        statusHistory: [...(t.statusHistory || []), { status, timestamp }]
      };
    }
    return t;
  });
}

export function addCommentToTicket(ticketId: string, userId: string, text: string) {
  mockTickets = mockTickets.map(t => {
    if (t.id === ticketId) {
      const newComment: Comment = {
        id: 'cmt_' + Math.random().toString(36).substr(2, 9),
        ticketId,
        userId,
        text,
        createdAt: new Date().toISOString()
      };
      return {
        ...t,
        comments: [...(t.comments || []), newComment],
        updatedAt: new Date().toISOString()
      };
    }
    return t;
  });
}

export function updateTicketRecommendation(ticketId: string, recommendation: string) {
  mockTickets = mockTickets.map(t => {
    if (t.id === ticketId) {
      return {
        ...t,
        ictRecommendation: recommendation,
        updatedAt: new Date().toISOString()
      };
    }
    return t;
  });
}

export function addAsset(asset: Omit<Asset, 'id'>) {
  const newAsset: Asset = {
    ...asset,
    id: 'ast_' + Math.random().toString(36).substr(2, 9),
  };
  mockAssets = [newAsset, ...mockAssets];
  return newAsset;
}

export function updateAsset(id: string, updates: Partial<Omit<Asset, 'id'>>) {
  mockAssets = mockAssets.map(a => 
    a.id === id ? { ...a, ...updates } : a
  );
}

