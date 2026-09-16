export interface LessonNavItem {
  id: string;
  slug: string;
  title: string;
  order: number;
  isFreePreview: boolean;
  readingTimeMinutes?: number | null;
  isCompleted?: boolean;
}

export interface TopicNavItem {
  id: string;
  slug: string;
  title: string;
  order: number;
  lessons: LessonNavItem[];
}

export interface ModuleNavItem {
  id: string;
  slug: string;
  title: string;
  order: number;
  topics: TopicNavItem[];
}

export interface PartNavItem {
  id: string;
  slug: string;
  title: string;
  order: number;
  modules: ModuleNavItem[];
}

export interface CourseNavigationData {
  id: string;
  slug: string;
  title: string;
  parts: PartNavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
