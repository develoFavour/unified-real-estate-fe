const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws").replace(/\/api\/v1\/?$/, "");

export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/auth/me",
    VERIFIED_AGENTS: "/auth/agents/verified",
  },
  PROPERTIES: {
    BASE: "/properties",
    ME: "/properties/me/all",
    OWNED: "/properties/owned",
    OWNER_AGENTS: "/properties/owner/agents",
    DASHBOARD_SUMMARY: "/properties/owner/summary",
    GET_ONE: (id: string) => `/properties/${id}`,
  },
  MAINTENANCE: {
    OWNER: "/maintenance/owner",
    AGENT: "/maintenance/agent",
    UPDATE_STATUS: (id: string) => `/maintenance/${id}/status`,
    CLOSE: (id: string) => `/maintenance/${id}/close`,
    REOPEN: (id: string) => `/maintenance/${id}/reopen`,
  },
  UPLOAD: {
    IMAGE: "/upload/image",
    DOCUMENT: "/upload/document",
  },
  INCOME: {
    OWNER: "/payments/owner",
  },
  AGENT: {
    SUMMARY: "/agent/summary",
    INVITATIONS: "/agent/invitations",
    ACCEPT_INVITE: (id: string) => `/agent/invitations/${id}/accept`,
    ACCEPT_MANDATE: (id: string) => `/agent/mandates/${id}/accept`,
  },
  TENANT: {
    DASHBOARD: "/tenant/dashboard",
    PAYMENTS: "/tenant/payments",
  },
  ADMIN: {
    SUMMARY: "/admin/summary",
    USERS: "/admin/users",
    PENDING_AGENTS: "/admin/users/pending-agents",
    USER_STATUS: (id: string) => `/admin/users/${id}/status`,
    PROPERTIES: "/admin/properties",
    PROPERTY_MODERATION: (id: string) => `/admin/properties/${id}/moderation`,
    PAYMENTS: "/admin/payments",
    LEASES: "/admin/leases",
    SALES: "/admin/sales",
    DISPUTES: "/admin/disputes",
  },
  DISPUTES: {
    BASE: "/disputes",
    MINE: "/disputes/mine",
    RESOLVE: (id: string) => `/disputes/${id}/resolve`,
    RESPOND: (id: string) => `/disputes/${id}/respond`,
  },
  MESSAGES: {
    CONVERSATIONS: "/messages/conversations",
    HISTORY: (id: string) => `/messages/history/${id}`,
    SEND: "/messages/send",
    WS: `${WS_BASE_URL}/ws`,
  },
};
