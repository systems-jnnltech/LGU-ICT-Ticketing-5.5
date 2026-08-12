import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { LayoutDashboard, FileText, Ticket, MonitorSmartphone, LogOut, Menu, UserCircle, Building2, BarChart3, Sun, Moon, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export function Layout({ children, currentTab, setCurrentTab }: { children: React.ReactNode, currentTab: string, setCurrentTab: (tab: string) => void }) {
  const { currentUser, users, login, logout, theme, toggleTheme, tickets } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'Admin';
  const isTech = currentUser.role === 'ICT Support';
  
  let ticketBadgeCount = 0;
  if (isAdmin) {
    ticketBadgeCount = tickets.filter(t => t.status === 'NEW').length;
  } else if (isTech) {
    ticketBadgeCount = tickets.filter(t => t.assignedToId === currentUser.id && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: false },
    { id: 'tickets', label: 'Tickets', icon: Ticket, disabled: false, badge: ticketBadgeCount > 0 ? ticketBadgeCount : undefined },
    { id: 'assets', label: 'Assets', icon: MonitorSmartphone, disabled: false },
    ...(isAdmin ? [
      { id: 'users', label: 'Users', icon: Users, disabled: false },
      { id: 'departments', label: 'Departments', icon: Building2, disabled: false },
      { id: 'audit_logs', label: 'Audit Logs', icon: FileText, disabled: false },
    ] : []),
    ...(isAdmin || isTech ? [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, disabled: false },
    ] : [])
  ];

  return (
    <div className="h-screen bg-bg text-ink flex overflow-hidden">
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative z-40 h-full
        transition-all duration-300 ease-in-out 
        ${isCollapsed ? 'md:w-[80px]' : 'md:w-[240px]'} 
        ${isMobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full md:translate-x-0'}
        bg-bg border-r border-border flex flex-col py-6
      `}>
        <div className={`flex items-center mb-8 px-4 ${isCollapsed && !isMobileOpen ? 'md:justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <img src="/LGU_LOGO1.png" alt="LGU Logo" className="w-full h-full object-contain" />
            </div>
            {(!isCollapsed || isMobileOpen) && <span className="font-bold text-sm text-ink whitespace-nowrap">ICT Ticketing</span>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:block p-1.5 rounded-lg text-ink-muted hover:text-accent hover:bg-accent/10 transition-colors ${isCollapsed ? 'absolute -right-3.5 bg-surface border border-border rounded-full shadow-sm' : ''}`}
            style={isCollapsed ? { top: '32px' } : {}}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-3">
          {navItems.map(item => (
            <div
              key={item.id}
              title={isCollapsed && !isMobileOpen ? item.label : undefined}
              onClick={() => {
                if (!item.disabled) {
                  setCurrentTab(item.id);
                  setIsMobileOpen(false);
                }
              }}
              className={`relative flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                currentTab === item.id 
                  ? 'text-accent bg-accent/10' 
                  : item.disabled ? 'text-ink-muted/50 cursor-not-allowed' : 'text-ink-muted hover:text-accent hover:bg-accent/10'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" style={isCollapsed && !isMobileOpen ? { margin: '0 auto' } : {}} />
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {isCollapsed && !isMobileOpen && item.badge !== undefined && (
                <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-sm ring-2 ring-bg">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4 px-3 items-center">
          <div className={`flex items-center gap-3 p-2 w-full ${isCollapsed && !isMobileOpen ? 'justify-center' : 'bg-surface/50 rounded-xl border border-border/50 shadow-sm'}`}>
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-border border border-accent flex items-center justify-center text-[10px] font-bold text-ink">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-semibold text-ink truncate">{currentUser.name}</div>
                <div className="text-[10px] text-ink-muted truncate">{currentUser.role}</div>
              </div>
            )}
          </div>
          <div 
            className={`flex items-center gap-3 p-2.5 w-full rounded-lg cursor-pointer text-ink-muted hover:text-accent hover:bg-accent/10 transition-colors ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
            title="Sign Out"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" style={isCollapsed && !isMobileOpen ? { margin: '0 auto' } : {}} />
            {(!isCollapsed || isMobileOpen) && <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <header className="border-b border-border px-4 md:px-8 h-16 flex items-center justify-between bg-surface flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              className="md:hidden p-1.5 -ml-2 text-ink-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-mono text-[10px] md:text-xs text-ink-muted flex gap-1 md:gap-2">
              <span className="hidden sm:inline">System / </span>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} / <span className="text-ink font-medium">Overview</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-[11px] font-mono">
            <button 
              onClick={toggleTheme}
              className="p-1.5 md:p-2 text-ink-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 md:w-4 md:h-4" /> : <Moon className="w-4 h-4 md:w-4 md:h-4" />}
            </button>
            <div className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></div>
              <span className="hidden sm:inline">LIVE SERVER</span>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 overflow-y-auto flex-1 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.05),transparent)]">
          {children}
        </div>
      </main>
    </div>
  );
}
