'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  subject: string;
  senderEmail: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  recipientCount: number;
  audienceType: string;
  type: string;
  audienceFilter: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface CampaignDetail extends Campaign {
  htmlContent: string;
  recipients: { id: string; email: string; status: string; sentAt: string | null; errorMessage: string | null }[];
}

interface Stats { sent: number; failed: number; scheduled: number; draft: number }

type Tab = 'compose' | 'history' | 'templates';
type AudienceType = 'specific' | 'all' | 'active' | 'inactive' | 'age_group';
type SendAction = 'send' | 'draft' | 'schedule';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'დრაფტი', SCHEDULED: 'დაგეგმილი', SENDING: 'იგზავნება', SENT: 'გაგზავნილი', FAILED: 'შეცდომა',
  // Per-recipient only (RecipientStatus) — confirmed by Resend's own delivery webhook,
  // not just "the send request was accepted" like SENT above.
  PENDING: 'მოლოდინში', DELIVERED: 'ჩაბარებულია', BOUNCED: 'არ ჩაბარდა', COMPLAINED: 'სპამში მონიშნა',
};
const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600', SCHEDULED: 'bg-blue-100 text-blue-700',
  SENDING: 'bg-yellow-100 text-yellow-700', SENT: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-700',
  PENDING: 'bg-gray-100 text-gray-600', DELIVERED: 'bg-green-100 text-green-700',
  BOUNCED: 'bg-red-100 text-red-700', COMPLAINED: 'bg-red-100 text-red-700',
};
const AUDIENCE_LABEL: Record<string, string> = {
  specific: 'კონკრეტული ელფოსტა', all: 'ყველა მომხმარებელი', active: 'აქტიური გამომწერები',
  inactive: 'არააქტიური მომხმარებლები', age_group: 'ასაკობრივი ჯგუფი',
};
const AGE_GROUPS = [
  { value: 'FROM_6', label: '6–8 თვე' },
  { value: 'FROM_9', label: '9–11 თვე' },
  { value: 'FROM_12', label: '12–23 თვე' },
  { value: 'FROM_24', label: '24+ თვე (2–3 წელი)' },
];

const TEMPLATES = {
  welcome: {
    label: '👋 Welcome Email',
    subject: 'კეთილი იყოს თქვენი მობრძანება MomMenu-ში 💚',
    body: '<h2>გამარჯობა! 👋</h2>\n<p>კეთილი იყოს თქვენი მობრძანება <strong>MomMenu</strong>-ში! 💚</p>\n<p>ჩვენ ვხარობთ, რომ გვირჩიეთ. MomMenu დაგეხმარებათ თქვენი ბავშვის კვების სწორად დაგეგმვაში.</p>\n<p><a href="https://mommenu.ge/dashboard" style="color:#465940;font-weight:bold;">პირადი კაბინეტი →</a></p>',
  },
  sub_active: {
    label: '✅ Subscription Activated',
    subject: 'თქვენი MomMenu პაკეტი გააქტიურდა ✅',
    body: '<h2>პაკეტი გააქტიურდა ✅</h2>\n<p>თქვენი MomMenu პაკეტი წარმატებით გააქტიურდა. ახლა შეგიძლიათ სრულად ისარგებლოთ ყველა შესაძლებლობით. 🎉</p>\n<p><a href="https://mommenu.ge/dashboard" style="color:#465940;font-weight:bold;">გეგმის ნახვა →</a></p>',
  },
  sub_expiring: {
    label: '⏰ Subscription Expiring',
    subject: 'თქვენი MomMenu პაკეტი იწურება ⏰',
    body: '<h2>პაკეტი იწურება ⏰</h2>\n<p>შეგახსენებთ, რომ თქვენი MomMenu პაკეტი მალე გასდის. გააგრძელეთ გამოწერა, რათა არ შეგიწყდეთ წვდომა.</p>\n<p><a href="https://mommenu.ge/dashboard" style="color:#465940;font-weight:bold;">გამოწერის განახლება →</a></p>',
  },
  weekly: {
    label: '🗓 Weekly Menu',
    subject: '🗓 თქვენი კვირის კვების გეგმა მზადაა!',
    body: '<h2>🗓 კვირის კვების გეგმა მზადაა!</h2>\n<p>გამარჯობა! ახალი კვირა დაიწყო და თქვენი ბავშვის კვების გეგმა განახლდა.</p>\n<p>შედით პირად კაბინეტში, რომ ნახოთ კვირის სრული მენიუ, რეცეპტები და საყიდლების სია.</p>\n<p><a href="https://mommenu.ge/dashboard" style="color:#465940;font-weight:bold;">კვების გეგმის ნახვა →</a></p>',
  },
  blog: {
    label: '📝 New Blog',
    subject: '📝 MomMenu-ზე ახალი სტატია გამოქვეყნდა',
    body: '<h2>📝 ახალი სტატია გამოქვეყნდა</h2>\n<p>MomMenu-ზე გამოქვეყნდა ახალი სტატია. გაეცანით ბლოგს და მიიღეთ სასარგებლო რჩევები.</p>\n<p><a href="https://mommenu.ge/blog" style="color:#465940;font-weight:bold;">ბლოგის ნახვა →</a></p>',
  },
  custom: {
    label: '✏️ Custom',
    subject: '',
    body: '',
  },
} as const;
type TemplateKey = keyof typeof TEMPLATES;

interface EmailTemplate {
  id: string;
  key: string;
  subjectKa: string;
  bodyKa: string;
  enabled: boolean;
  updatedAt: string;
}

// Mirrors lib/email.ts's DISABLEABLE_KEYS — only these periodic/broadcast templates get an
// on/off switch. Critical transactional templates (welcome, password reset, subscription
// confirmed, etc.) always show the static "ავტო" badge — they can't be turned off here.
const DISABLEABLE_KEYS = ['subscription_expiring', 'weekly_menu', 'new_blog', 'birthday_wish'];

const TEMPLATE_META: Record<string, { name: string; vars: string[] }> = {
  welcome:                { name: 'Welcome Email 💚',            vars: ['{{name}}'] },
  subscription_confirmed: { name: 'Subscription Activated ✅',  vars: ['{{name}}','{{planName}}','{{amount}}','{{startDate}}','{{endDate}}'] },
  subscription_expiring:  { name: 'Subscription Expiring ⏰',   vars: ['{{name}}'] },
  password_reset:         { name: 'Password Reset 🔐',           vars: ['{{code}}'] },
  password_changed:       { name: 'Password Changed ✔',          vars: ['{{name}}'] },
  weekly_menu:            { name: 'Weekly Menu 🗓',              vars: ['{{name}}'] },
  new_blog:               { name: 'New Blog Post 📝',            vars: ['{{name}}','{{blogTitle}}','{{blogUrl}}'] },
  birthday_wish:          { name: 'Birthday Wish 🎉',             vars: [] },
};

function fmt(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('ka-GE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmailCenterClient({
  initialCampaigns,
  initialStats,
}: {
  initialCampaigns: Campaign[];
  initialStats: Stats;
}) {
  const [tab, setTab] = useState<Tab>('compose');
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [stats, setStats] = useState<Stats>(initialStats);

  // Compose state
  const [subject, setSubject] = useState('');
  const [senderEmail, setSenderEmail] = useState('info@mommenu.ge');
  const [audienceType, setAudienceType] = useState<AudienceType>('specific');
  // "specific" audience — a checkable list of every registered user, instead of pasting
  // emails by hand. Lets a big send be split across several days: pick some today, send;
  // tomorrow reopen with the same subject and the ones already reached show as sent.
  const [allUsers, setAllUsers] = useState<{ email: string; name: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [alreadySentEmails, setAlreadySentEmails] = useState<Set<string>>(new Set());
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('FROM_6');
  const [sendAction, setSendAction] = useState<SendAction>('send');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaveResult, setTemplateSaveResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const templateEditorRef = useRef<HTMLDivElement>(null);

  // History state
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // Rich text helpers
  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value ?? '');
  }, []);

  const insertLink = useCallback(() => {
    const url = window.prompt('ბმულის URL:');
    if (url) exec('createLink', url);
  }, [exec]);

  const execT = useCallback((cmd: string, value?: string) => {
    templateEditorRef.current?.focus();
    document.execCommand(cmd, false, value ?? '');
  }, []);

  const insertTemplateLink = useCallback(() => {
    const url = window.prompt('ბმულის URL:');
    if (url) execT('createLink', url);
  }, [execT]);

  const insertImage = useCallback(() => {
    const url = window.prompt('სურათის URL:');
    if (url) exec('insertHTML', `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`);
  }, [exec]);

  const DB_KEY_MAP: Record<TemplateKey, string | null> = {
    welcome: 'welcome',
    sub_active: 'subscription_confirmed',
    sub_expiring: 'subscription_expiring',
    weekly: 'weekly_menu',
    blog: 'new_blog',
    custom: null,
  };

  const applyTemplate = (key: TemplateKey) => {
    const dbKey = DB_KEY_MAP[key];
    const dbT = dbKey ? templates.find(t => t.key === dbKey) : null;
    if (dbT) {
      setSubject(dbT.subjectKa);
      if (editorRef.current) editorRef.current.innerHTML = dbT.bodyKa;
    } else {
      const t = TEMPLATES[key];
      setSubject(t.subject);
      if (editorRef.current) editorRef.current.innerHTML = t.body;
    }
  };

  const refreshData = async () => {
    const res = await fetch('/api/admin/emails');
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns);
      setStats(data.stats);
    }
  };

  const loadRecipientPicker = useCallback(async (subjectForLookup: string) => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/emails/recipients?subject=${encodeURIComponent(subjectForLookup.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users ?? []);
        setAlreadySentEmails(new Set<string>(data.alreadySent ?? []));
        // Never leave an already-sent address checked (e.g. subject was retyped to match
        // an earlier campaign after some were already picked under a different subject).
        setSelectedEmails((prev) => {
          const already = new Set<string>(data.alreadySent ?? []);
          const next = new Set<string>();
          prev.forEach((e) => { if (!already.has(e)) next.add(e); });
          return next;
        });
      }
    } catch {
      // leave whatever list is already loaded — a failed refresh shouldn't clear it
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load the picker once "specific" is selected, and re-check "already sent" every time
  // the subject changes (debounced) — retyping a previous campaign's exact subject is
  // how a multi-day send picks up where it left off.
  useEffect(() => {
    if (audienceType !== 'specific') return;
    const t = setTimeout(() => { loadRecipientPicker(subject); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceType, subject]);

  const filteredUsers = allUsers.filter((u) => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
  });

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      for (const u of filteredUsers) if (!alreadySentEmails.has(u.email)) next.add(u.email);
      return next;
    });
  };

  const clearSelectedEmails = () => setSelectedEmails(new Set());

  const handleSend = async () => {
    const htmlContent = editorRef.current?.innerHTML ?? '';
    if (!subject.trim() || !htmlContent.trim()) {
      setSendResult({ type: 'error', msg: 'სათაური და შინაარსი სავალდებულოა.' });
      return;
    }

    if (audienceType === 'specific' && selectedEmails.size === 0) {
      setSendResult({ type: 'error', msg: 'აირჩიეთ მინიმუმ ერთი მიმღები სიიდან.' });
      return;
    }

    const audienceFilter =
      audienceType === 'specific' ? Array.from(selectedEmails).join(',') :
      audienceType === 'age_group' ? selectedAgeGroup : undefined;

    if (sendAction === 'schedule' && !scheduledAt) {
      setSendResult({ type: 'error', msg: 'გთხოვთ, დღე და საათი მიუთითოთ.' });
      return;
    }

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject, htmlContent, senderEmail,
          action: sendAction, audienceType,
          audienceFilter,
          scheduledAt: sendAction === 'schedule' ? scheduledAt : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult({ type: 'error', msg: data.error ?? 'შეცდომა' });
      } else {
        const msg = sendAction === 'draft' ? 'დრაფტი შენახულია.' :
          sendAction === 'schedule' ? 'მეილი დაიგეგმა.' :
          `გაიგზავნა ${data.sent} მიმღებზე.`;
        setSendResult({ type: 'success', msg });
        setSubject('');
        setSelectedEmails(new Set());
        if (editorRef.current) editorRef.current.innerHTML = '';
        await refreshData();
      }
    } catch {
      setSendResult({ type: 'error', msg: 'სერვერის შეცდომა.' });
    } finally {
      setSending(false);
    }
  };

  const handleWeeklyMenu = async () => {
    if (!window.confirm('გაგზავნოთ კვირის მენიუ ყველა აქტიურ გამომწერს?')) return;
    setWeeklyLoading(true);
    try {
      const res = await fetch('/api/admin/emails/weekly-menu', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ გაიგზავნა ${data.sent}/${data.total} მიმღებზე.`);
        await refreshData();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch {
      alert('❌ სერვერის შეცდომა.');
    } finally {
      setWeeklyLoading(false);
    }
  };

  const handleTestSend = async () => {
    const htmlContent = editorRef.current?.innerHTML ?? '';
    if (!subject.trim() || !htmlContent.trim()) {
      setTestResult({ type: 'error', msg: 'სათაური და შინაარსი სავალდებულოა.' });
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, htmlContent, senderEmail }),
      });
      if (res.ok) {
        setTestResult({ type: 'success', msg: 'სატესტო მეილი წარმატებით გაიგზავნა.' });
        await refreshData();
      } else {
        setTestResult({ type: 'error', msg: 'სატესტო მეილის გაგზავნა ვერ მოხერხდა.' });
      }
    } catch {
      setTestResult({ type: 'error', msg: 'სატესტო მეილის გაგზავნა ვერ მოხერხდა.' });
    } finally {
      setTestLoading(false);
    }
  };

  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const res = await fetch('/api/admin/emails/templates');
      if (res.ok) setTemplates(await res.json());
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (tab === 'templates' && templates.length === 0) fetchTemplates();
  }, [tab, templates.length, fetchTemplates]);

  const openEditTemplate = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setEditSubject(t.subjectKa);
    setTemplateSaveResult(null);
    setTimeout(() => {
      if (templateEditorRef.current) templateEditorRef.current.innerHTML = t.bodyKa;
    }, 30);
  };

  const insertVar = (variable: string) => {
    templateEditorRef.current?.focus();
    document.execCommand('insertText', false, variable);
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;
    const bodyKa = templateEditorRef.current?.innerHTML ?? '';
    setSavingTemplate(true);
    setTemplateSaveResult(null);
    try {
      const res = await fetch('/api/admin/emails/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: editingTemplate.key, subjectKa: editSubject, bodyKa }),
      });
      if (res.ok) {
        setTemplateSaveResult({ type: 'success', msg: 'შაბლონი წარმატებით შენახულია.' });
        await fetchTemplates();
        setTimeout(() => setEditingTemplate(null), 1500);
      } else {
        setTemplateSaveResult({ type: 'error', msg: 'შეცდომა შენახვისას.' });
      }
    } catch {
      setTemplateSaveResult({ type: 'error', msg: 'შეცდომა შენახვისას.' });
    } finally {
      setSavingTemplate(false);
    }
  };

  // Turns a periodic template's sending on/off — takes effect immediately, no deploy needed
  // (lib/email.ts's send functions check this same `enabled` flag before every send).
  // Optimistic: flips the local card right away, rolls back if the request fails.
  const toggleTemplateEnabled = async (key: string, next: boolean) => {
    setTogglingKey(key);
    setTemplates((prev) => prev.map((t) => (t.key === key ? { ...t, enabled: next } : t)));
    try {
      const res = await fetch('/api/admin/emails/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: next }),
      });
      if (!res.ok) {
        setTemplates((prev) => prev.map((t) => (t.key === key ? { ...t, enabled: !next } : t)));
        alert('❌ ვერ შეიცვალა. სცადეთ თავიდან.');
      }
    } catch {
      setTemplates((prev) => prev.map((t) => (t.key === key ? { ...t, enabled: !next } : t)));
      alert('❌ სერვერის შეცდომა.');
    } finally {
      setTogglingKey(null);
    }
  };

  const openPreview = () => {
    setPreviewContent(editorRef.current?.innerHTML ?? '');
    setShowPreview(true);
  };

  const handleCampaignClick = async (id: string) => {
    setLoadingDetails(true);
    setSelectedCampaign(null);
    try {
      const res = await fetch(`/api/admin/emails/${id}`);
      if (res.ok) setSelectedCampaign(await res.json());
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchStatus = filter === 'all' || c.status === filter.toUpperCase();
    const matchSearch = !search || c.subject.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: '#f5f2ea' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#465940]">Email Center</h1>
        <p className="text-sm text-[#465940]/60 mt-1">Resend-ის მეშვეობით გააგზავნეთ მეილები</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {([
          { label: 'გაგზავნილი', value: stats.sent, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
          { label: 'შეცდომა', value: stats.failed, color: 'text-red-600', bg: 'bg-red-50', icon: '❌' },
          { label: 'დაგეგმილი', value: stats.scheduled, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🗓' },
          { label: 'დრაფტი', value: stats.draft, color: 'text-gray-600', bg: 'bg-gray-50', icon: '📝' },
        ] as const).map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          ['compose',   '✉️ Compose'],
          ['history',   '📋 History'],
          ['templates', '📄 Templates'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${
              tab === t ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-white text-[#465940] border border-[#465940]/20 hover:border-[#465940]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── COMPOSE TAB ─────────────────────────────────────────────────────── */}
      {tab === 'compose' && (
        <div className="space-y-5">
          {/* Templates */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-3">შაბლონები</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(TEMPLATES) as [TemplateKey, typeof TEMPLATES[TemplateKey]][]).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="px-3 py-1.5 rounded-full border border-[#465940]/20 text-xs font-semibold text-[#465940] hover:bg-[#465940] hover:text-[#FDFBF0] transition"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-5">
            {/* Compose Form */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              {/* From */}
              <div>
                <label className="block text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-1.5">From</label>
                <select
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#465940] focus:outline-none focus:border-[#465940] bg-white"
                >
                  <option value="info@mommenu.ge">MomMenu &lt;info@mommenu.ge&gt;</option>
                  <option value="support@mommenu.ge">MomMenu Support &lt;support@mommenu.ge&gt;</option>
                  <option value="no-reply@mommenu.ge">MomMenu Notifications &lt;no-reply@mommenu.ge&gt;</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="მეილის სათაური..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#465940]"
                  style={{ color: '#111' }}
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-1.5">შინაარსი</label>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 border border-gray-200 border-b-0 rounded-t-xl bg-gray-50">
                  {[
                    { label: 'B', title: 'Bold', cmd: () => exec('bold'), style: 'font-bold' },
                    { label: 'I', title: 'Italic', cmd: () => exec('italic'), style: 'italic' },
                    { label: 'U', title: 'Underline', cmd: () => exec('underline'), style: 'underline' },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      title={btn.title}
                      onMouseDown={(e) => { e.preventDefault(); btn.cmd(); }}
                      className={`w-8 h-8 rounded-lg text-sm text-[#465940] hover:bg-[#465940]/10 transition ${btn.style}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                  <div className="w-px h-8 bg-gray-200 mx-1" />
                  <button type="button" title="Bullet List" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className="w-8 h-8 rounded-lg text-sm text-[#465940] hover:bg-[#465940]/10 transition">•≡</button>
                  <button type="button" title="Ordered List" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }} className="w-8 h-8 rounded-lg text-sm text-[#465940] hover:bg-[#465940]/10 transition">1≡</button>
                  <div className="w-px h-8 bg-gray-200 mx-1" />
                  <button type="button" title="Link" onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="px-2 h-8 rounded-lg text-xs text-[#465940] hover:bg-[#465940]/10 transition">🔗 Link</button>
                  <button type="button" title="Image" onMouseDown={(e) => { e.preventDefault(); insertImage(); }} className="px-2 h-8 rounded-lg text-xs text-[#465940] hover:bg-[#465940]/10 transition">🖼 Image</button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[220px] p-4 border border-gray-200 rounded-b-xl text-sm text-[#465940] focus:outline-none focus:border-[#465940] overflow-auto"
                  style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.7 }}
                />
              </div>

              {/* Preview + Test buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={openPreview}
                  className="flex-1 border border-[#465940]/30 text-[#465940] py-2.5 rounded-full font-bold text-sm hover:border-[#465940] hover:bg-[#465940]/5 transition"
                >
                  👁 Preview
                </button>
                <button
                  type="button"
                  onClick={handleTestSend}
                  disabled={testLoading}
                  className="flex-1 border border-[#465940] text-[#465940] py-2.5 rounded-full font-bold text-sm hover:bg-[#465940]/10 transition disabled:opacity-60"
                >
                  {testLoading ? 'იგზავნება...' : '🧪 Send Test Email'}
                </button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${testResult.type === 'success' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                  {testResult.msg}
                </div>
              )}

              {/* Send Result */}
              {sendResult && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${sendResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {sendResult.msg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {(['send', 'draft', 'schedule'] as SendAction[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSendAction(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      sendAction === a ? 'bg-[#465940] text-[#FDFBF0] border-[#465940]' : 'bg-white text-[#465940] border-[#465940]/30 hover:border-[#465940]'
                    }`}
                  >
                    {a === 'send' ? 'Send Now' : a === 'draft' ? 'Save Draft' : 'Schedule'}
                  </button>
                ))}
              </div>

              {/* Schedule Date Picker */}
              {sendAction === 'schedule' && (
                <div>
                  <label className="block text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-1.5">გაგზავნის თარიღი და საათი</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#465940]"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="w-full bg-[#465940] text-[#FDFBF0] py-3 rounded-full font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
              >
                {sending ? 'იგზავნება...' :
                  sendAction === 'send' ? 'გაგზავნა →' :
                  sendAction === 'draft' ? 'დრაფტის შენახვა' :
                  'დაგეგმვა'}
              </button>
            </div>

            {/* Audience Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-4">მიმღები</p>
                <div className="space-y-2.5">
                  {([
                    ['specific', 'კონკრეტული ელფოსტა'],
                    ['all', 'ყველა მომხმარებელი'],
                    ['active', 'აქტიური გამომწერები'],
                    ['inactive', 'არააქტიური მომხმარებლები'],
                    ['age_group', 'ასაკობრივი ჯგუფი'],
                  ] as [AudienceType, string][]).map(([v, label]) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="audience"
                        value={v}
                        checked={audienceType === v}
                        onChange={() => setAudienceType(v)}
                        className="accent-[#465940]"
                      />
                      <span className="text-sm text-[#465940]">{label}</span>
                    </label>
                  ))}
                </div>

                {audienceType === 'specific' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <label className="text-xs font-bold text-[#465940]/60">
                        მიმღების არჩევა {selectedEmails.size > 0 && `(${selectedEmails.size} მონიშნული)`}
                      </label>
                      <div className="flex gap-2 flex-shrink-0">
                        <button type="button" onClick={selectAllFiltered}
                          className="text-[11px] font-bold text-[#465940] hover:underline">ყველას მონიშვნა</button>
                        <button type="button" onClick={clearSelectedEmails}
                          className="text-[11px] font-bold text-red-500 hover:underline">გასუფთავება</button>
                      </div>
                    </div>
                    <input
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      placeholder="ძებნა სახელით ან ელფოსტით..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#465940] mb-2"
                      style={{ color: '#111' }}
                    />
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                      {usersLoading ? (
                        <p className="text-xs text-gray-400 text-center py-4">იტვირთება...</p>
                      ) : filteredUsers.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">მომხმარებელი ვერ მოიძებნა</p>
                      ) : (
                        filteredUsers.map((u) => {
                          const alreadySent = alreadySentEmails.has(u.email);
                          return (
                            <label key={u.email}
                              className={`flex items-center gap-2.5 px-3 py-2 text-xs ${alreadySent ? 'opacity-50' : 'cursor-pointer hover:bg-gray-50'}`}>
                              <input
                                type="checkbox"
                                checked={selectedEmails.has(u.email)}
                                disabled={alreadySent}
                                onChange={() => toggleEmail(u.email)}
                                className="accent-[#465940] flex-shrink-0"
                              />
                              <span className="flex-1 min-w-0 truncate" style={{ color: '#111' }}>
                                {u.name} <span className="text-gray-400">— {u.email}</span>
                              </span>
                              {alreadySent && (
                                <span className="text-[10px] font-bold text-green-600 whitespace-nowrap flex-shrink-0">✓ გაეგზავნა</span>
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>
                    {subject.trim() !== '' && (
                      <p className="text-[11px] text-[#465940]/50 italic mt-1.5">
                        „✓ გაეგზავნა" — ამ ზუსტი სათაურის მეილი უკვე წარმატებით გაეგზავნა ამ მისამართს (ვერ მონიშნავთ, რომ ორჯერ არ გაეგზავნოს). დიდი სიის რამდენიმე დღეზე გასანაწილებლად, დარჩენილებს ხვალ იმავე სათაურით გამოგზავნეთ.
                      </p>
                    )}
                  </div>
                )}

                {audienceType === 'age_group' && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-xs font-bold text-[#465940]/60 mb-1.5">ასაკობრივი ჯგუფი</label>
                    {AGE_GROUPS.map((g) => (
                      <label key={g.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ageGroup"
                          value={g.value}
                          checked={selectedAgeGroup === g.value}
                          onChange={() => setSelectedAgeGroup(g.value)}
                          className="accent-[#465940]"
                        />
                        <span className="text-sm text-[#465940]">{g.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Menu Quick Send */}
              <div className="bg-[#465940] rounded-2xl p-5">
                <p className="text-[#FDFBF0] font-bold text-sm mb-1">🗓 კვირის მენიუ</p>
                <p className="text-[#FDFBF0]/70 text-xs mb-4">ყველა აქტიურ გამომწერს ერთი ღილაკით</p>
                <button
                  type="button"
                  onClick={handleWeeklyMenu}
                  disabled={weeklyLoading}
                  className="w-full bg-[#FDFBF0] text-[#465940] py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
                >
                  {weeklyLoading ? 'იგზავნება...' : 'Send Weekly Menu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="ძიება სათაურით..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#465940]"
            />
            <div className="flex gap-1 flex-wrap">
              {['all', 'sent', 'failed', 'draft', 'scheduled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    filter === f ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'ყველა' : STATUS_LABEL[f.toUpperCase()] ?? f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredCampaigns.length === 0 ? (
            <div className="py-16 text-center text-[#465940]/40">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">მეილები ვერ მოიძებნა</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['სათაური', 'მიმღებები', 'გამომგზავნი', 'სტატუსი', 'თარიღი'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#465940]/50 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => handleCampaignClick(c.id)}
                      className="border-b border-gray-50 hover:bg-[#465940]/5 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="font-semibold text-[#465940] truncate">{c.subject}</p>
                          {c.type === 'TEST' && (
                            <span className="flex-shrink-0 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">TEST</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{AUDIENCE_LABEL[c.audienceType] ?? c.audienceType}</p>
                      </td>
                      <td className="px-4 py-3 text-[#465940]/70">{c.recipientCount}</td>
                      <td className="px-4 py-3 text-[#465940]/70 text-xs">{c.senderEmail}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#465940]/50 text-xs whitespace-nowrap">{fmt(c.sentAt ?? c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TEMPLATES TAB ───────────────────────────────────────────────────── */}
      {tab === 'templates' && (
        <div>
          <p className="text-sm text-[#465940]/60 mb-5">
            ავტომატური მეილების შაბლონები. ცვლილება მყისიერად ამოქმედდება — კოდის შეხება არ სჭირდება.
          </p>

          {templatesLoading ? (
            <div className="py-16 text-center text-[#465940]/40">
              <div className="text-3xl mb-2">⏳</div>
              <p className="text-sm">იტვირთება...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {templates.map((t) => {
                const meta = TEMPLATE_META[t.key];
                const canDisable = DISABLEABLE_KEYS.includes(t.key);
                const isOff = canDisable && t.enabled === false;
                return (
                  <div
                    key={t.key}
                    className={`rounded-2xl shadow-sm p-5 flex flex-col gap-3 transition ${isOff ? 'bg-gray-50 opacity-70' : 'bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-[#465940]">{meta?.name ?? t.key}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{t.subjectKa}</p>
                      </div>
                      {canDisable ? (
                        <button
                          type="button"
                          onClick={() => toggleTemplateEnabled(t.key, !t.enabled)}
                          disabled={togglingKey === t.key}
                          title={t.enabled ? 'გამორთვა — გაგზავნა შეწყდება მყისიერად' : 'ჩართვა'}
                          className="flex-shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <span className={`text-xs font-bold ${t.enabled ? 'text-green-700' : 'text-gray-400'}`}>
                            {t.enabled ? 'ჩართული' : 'გამორთული'}
                          </span>
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${t.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${t.enabled ? 'translate-x-4.5' : 'translate-x-1'}`}
                              style={{ transform: t.enabled ? 'translateX(18px)' : 'translateX(2px)' }}
                            />
                          </span>
                        </button>
                      ) : (
                        <span className="flex-shrink-0 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">ავტო</span>
                      )}
                    </div>
                    {isOff && (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 -mt-1">
                        ⚠️ გამორთულია — ეს მეილი არავის ეგზავნება, სანამ არ ჩართავთ.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {meta?.vars.map((v) => (
                        <span key={v} className="text-xs bg-[#465940]/10 text-[#465940] px-2 py-0.5 rounded-full font-mono">{v}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      ბოლო ცვლილება: {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('ka-GE') : '—'}
                    </p>
                    <button
                      onClick={() => openEditTemplate(t)}
                      className="w-full border border-[#465940]/30 text-[#465940] py-2 rounded-xl text-sm font-bold hover:bg-[#465940]/5 transition"
                    >
                      ✏️ შაბლონის რედაქტირება
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TEMPLATE EDIT MODAL ─────────────────────────────────────────────── */}
      {editingTemplate && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTemplate(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-black text-[#465940]">{TEMPLATE_META[editingTemplate.key]?.name ?? editingTemplate.key}</p>
                <p className="text-xs text-gray-400 mt-0.5">შეცვალეთ სათაური და შინაარსი</p>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-1.5">Subject (სათაური)</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#465940] focus:outline-none focus:border-[#465940]"
                />
              </div>

              {/* Variables */}
              <div>
                <label className="block text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-2">ცვლადები (დააჭირეთ ჩასაწერად)</label>
                <div className="flex flex-wrap gap-1.5">
                  {(TEMPLATE_META[editingTemplate.key]?.vars ?? []).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVar(v)}
                      className="font-mono text-xs bg-[#465940]/10 text-[#465940] px-2.5 py-1 rounded-full hover:bg-[#465940] hover:text-[#FDFBF0] transition"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rich Text Body */}
              <div>
                <label className="block text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-1.5">შინაარსი</label>
                <div className="flex flex-wrap gap-1 p-2 border border-gray-200 border-b-0 rounded-t-xl bg-gray-50">
                  {[
                    { label: 'B', title: 'Bold',      cmd: () => execT('bold'),      style: 'font-bold' },
                    { label: 'I', title: 'Italic',    cmd: () => execT('italic'),    style: 'italic' },
                    { label: 'U', title: 'Underline', cmd: () => execT('underline'), style: 'underline' },
                  ].map((btn) => (
                    <button key={btn.label} type="button" title={btn.title}
                      onMouseDown={(e) => { e.preventDefault(); btn.cmd(); }}
                      className={`w-8 h-8 rounded-lg text-sm text-[#465940] hover:bg-[#465940]/10 transition ${btn.style}`}>
                      {btn.label}
                    </button>
                  ))}
                  <div className="w-px h-8 bg-gray-200 mx-1" />
                  <button type="button" title="Bullet List" onMouseDown={(e) => { e.preventDefault(); execT('insertUnorderedList'); }} className="w-8 h-8 rounded-lg text-sm text-[#465940] hover:bg-[#465940]/10 transition">•≡</button>
                  <button type="button" title="Ordered List" onMouseDown={(e) => { e.preventDefault(); execT('insertOrderedList'); }} className="w-8 h-8 rounded-lg text-sm text-[#465940] hover:bg-[#465940]/10 transition">1≡</button>
                  <div className="w-px h-8 bg-gray-200 mx-1" />
                  <button type="button" title="Link" onMouseDown={(e) => { e.preventDefault(); insertTemplateLink(); }} className="px-2 h-8 rounded-lg text-xs text-[#465940] hover:bg-[#465940]/10 transition">🔗 Link</button>
                </div>
                <div
                  ref={templateEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[220px] p-4 border border-gray-200 rounded-b-xl text-sm text-[#465940] focus:outline-none focus:border-[#465940] overflow-auto"
                  style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.7 }}
                />
              </div>

              {/* Save result */}
              {templateSaveResult && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${templateSaveResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {templateSaveResult.msg}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditingTemplate(null)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50 transition">
                  გაუქმება
                </button>
                <button
                  onClick={saveTemplate}
                  disabled={savingTemplate}
                  className="flex-1 bg-[#465940] text-[#FDFBF0] py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition disabled:opacity-60"
                >
                  {savingTemplate ? 'ინახება...' : 'შენახვა'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ───────────────────────────────────────────────────── */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between">
              <div className="min-w-0 pr-4">
                <p className="text-xs text-gray-400 mb-0.5">Subject:</p>
                <p className="font-black text-[#465940] leading-tight truncate">{subject || '(სათაური ცარიელია)'}</p>
                <p className="text-xs text-gray-400 mt-1">From: {senderEmail}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-3">Email Preview</p>
              {previewContent ? (
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#465940;padding:24px;max-width:100%;line-height:1.7;background:#FDFBF0;}a{color:#465940;}img{max-width:100%;border-radius:8px;}h1,h2,h3{color:#465940;}ul,ol{padding-left:20px;}</style></head><body>${previewContent}</body></html>`}
                  className="w-full border border-gray-100 rounded-xl"
                  style={{ height: 420 }}
                  title="Email Preview"
                />
              ) : (
                <div className="h-32 flex items-center justify-center text-[#465940]/40 text-sm border border-gray-100 rounded-xl">
                  შინაარსი ცარიელია
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700 font-medium">
                  💡 ეს preview ასახავს მხოლოდ შინაარსს. გაგზავნისას მეილი ჩაიდება MomMenu-ს სრულ template-ში.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ────────────────────────────────────────────────────── */}
      {(selectedCampaign || loadingDetails) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCampaign(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {loadingDetails ? (
              <div className="py-16 text-center text-[#465940]/40">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-sm">იტვირთება...</p>
              </div>
            ) : selectedCampaign ? (
              <>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between">
                  <div>
                    <h2 className="font-black text-[#465940] text-lg leading-tight">{selectedCampaign.subject}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[selectedCampaign.status]}`}>
                        {STATUS_LABEL[selectedCampaign.status]}
                      </span>
                      <span className="text-xs text-gray-400">{selectedCampaign.senderEmail}</span>
                      <span className="text-xs text-gray-400">{fmt(selectedCampaign.sentAt ?? selectedCampaign.createdAt)}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCampaign(null)} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 flex-shrink-0 ml-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Info row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">მიმღებები</p>
                      <p className="font-bold text-[#465940]">{selectedCampaign.recipientCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">აუდიტორია</p>
                      <p className="font-bold text-[#465940] text-sm">{AUDIENCE_LABEL[selectedCampaign.audienceType] ?? selectedCampaign.audienceType}</p>
                    </div>
                  </div>

                  {/* Email Preview */}
                  <div>
                    <p className="text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-2">მეილის გადახედვა</p>
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#465940;padding:20px;max-width:100%;line-height:1.7;}a{color:#465940;}img{max-width:100%;border-radius:8px;}</style></head><body>${selectedCampaign.htmlContent}</body></html>`}
                      className="w-full border border-gray-100 rounded-xl"
                      style={{ height: 280 }}
                      title="Email Preview"
                    />
                  </div>

                  {/* Recipients */}
                  {selectedCampaign.recipients.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#465940]/60 uppercase tracking-wider mb-2">
                        მიმღებები ({selectedCampaign.recipients.length})
                      </p>
                      <div className="border border-gray-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        {selectedCampaign.recipients.map((r) => (
                          <div key={r.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                            <span className="text-sm text-[#465940]">{r.email}</span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status] ?? 'bg-gray-100 text-gray-600'}`}
                              title={r.status === 'FAILED' && r.errorMessage ? r.errorMessage : undefined}
                            >
                              {STATUS_LABEL[r.status] ?? r.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
