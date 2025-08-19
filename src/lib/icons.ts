import {
  // User & People Icons
  Users,
  User,
  UserPlus,
  UserCheck,
  UserX,
  
  // Business & Work Icons
  Briefcase,
  Building2,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  
  // Communication Icons
  MessageSquare,
  Mail,
  Phone,
  Bell,
  
  // Time & Calendar Icons
  Calendar,
  Clock,
  Timer,
  CalendarDays,
  
  // Documents & Files Icons
  FileText,
  File,
  FileCheck,
  FileClock,
  Folder,
  
  // Actions & Navigation Icons
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  
  // Status Icons
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  
  // System Icons
  Settings,
  Database,
  Activity,
  Shield,
  Lock,
  
  // HR Specific Icons
  Award,
  GraduationCap,
  Heart,
  Zap,
  Star,
  
  // Money & Finance Icons
  DollarSign,
  Euro,
  CreditCard,
  
  // Misc Icons
  Home,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Mapowanie kategorii do ikon
export const iconCategories = {
  // Użytkownicy i ludzie
  users: {
    all: Users,
    single: User,
    add: UserPlus,
    active: UserCheck,
    inactive: UserX
  },
  
  // Biznes i praca
  business: {
    company: Building2,
    assignments: Briefcase,
    targets: Target,
    growth: TrendingUp,
    charts: BarChart3,
    pie: PieChart
  },
  
  // Komunikacja
  communication: {
    chat: MessageSquare,
    email: Mail,
    phone: Phone,
    notifications: Bell
  },
  
  // Czas i kalendarz
  time: {
    calendar: Calendar,
    clock: Clock,
    timer: Timer,
    days: CalendarDays
  },
  
  // Dokumenty
  documents: {
    file: FileText,
    generic: File,
    approved: FileCheck,
    pending: FileClock,
    folder: Folder
  },
  
  // Akcje
  actions: {
    add: Plus,
    edit: Edit,
    delete: Trash2,
    view: Eye,
    download: Download,
    upload: Upload,
    search: Search,
    filter: Filter
  },
  
  // Status
  status: {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  },
  
  // System
  system: {
    settings: Settings,
    database: Database,
    activity: Activity,
    security: Shield,
    lock: Lock
  },
  
  // HR specyficzne
  hr: {
    performance: Award,
    training: GraduationCap,
    satisfaction: Heart,
    energy: Zap,
    rating: Star
  },
  
  // Finanse
  finance: {
    dollar: DollarSign,
    euro: Euro,
    payment: CreditCard
  },
  
  // Nawigacja
  navigation: {
    home: Home,
    menu: Menu,
    close: X,
    right: ChevronRight,
    left: ChevronLeft,
    up: ChevronUp,
    down: ChevronDown
  }
};

// Helper funkcje do łatwego dostępu
export const getIcon = (category: keyof typeof iconCategories, name: string) => {
  const categoryIcons = iconCategories[category] as Record<string, unknown>;
  return (categoryIcons[name] as typeof File) || File;
};

// Predefiniowane ikony dla częstych użyć
export const commonIcons = {
  // Dashboard stats
  totalUsers: Users,
  totalClients: Building2,
  totalAssignments: Briefcase,
  performance: TrendingUp,
  
  // HR Dashboard
  employees: Users,
  recruitment: UserPlus,
  schedule: Calendar,
  reports: BarChart3,
  training: GraduationCap,
  assignments: FileText,
  
  // Actions
  create: Plus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  
  // Status indicators
  active: CheckCircle,
  inactive: XCircle,
  pending: Clock,
  warning: AlertCircle
};

export default iconCategories;
