import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE_ROOT = 'C:\\Users\\JAGADEESH M\\Documents\\CourseContent\\modules';
const ASSETS_DEST = path.join(process.cwd(), 'public', 'course-assets');

// Helper to convert Title Case or directory name to a clean URL slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper to clean markdown title from first # heading or filename
function extractTitle(content: string, fallback: string): { title: string; cleanContent: string } {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return { title: match[1].trim(), cleanContent: content };
  }
  const clean = fallback
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { title: clean, cleanContent: content };
}

// Helper to calculate estimated reading time
function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 200));
}

// Helper to extract first paragraph as description/tagline
function extractDescription(content: string): string {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('!'));
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/[*_`]/g, '').trim();
    return firstLine.length > 180 ? firstLine.slice(0, 177) + '...' : firstLine;
  }
  return 'Master this key system design architectural concept.';
}

export async function importCourseContent(dryRun = false) {
  console.log(`Starting Course Content Import (dryRun: ${dryRun})...`);

  // Ensure public/course-assets exists
  if (!fs.existsSync(ASSETS_DEST)) {
    fs.mkdirSync(ASSETS_DEST, { recursive: true });
  }

  // Copy all SVGs and asset files to public/course-assets
  const allSvgs: { filename: string; sourcePath: string }[] = [];
  function collectAssets(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectAssets(fullPath);
      } else if (entry.name.endsWith('.svg') || entry.name.endsWith('.png') || entry.name.endsWith('.jpg')) {
        allSvgs.push({ filename: entry.name, sourcePath: fullPath });
        const destPath = path.join(ASSETS_DEST, entry.name);
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(fullPath, destPath);
        }
      }
    }
  }
  collectAssets(SOURCE_ROOT);
  console.log(`Copied ${allSvgs.length} media assets to /public/course-assets/`);

  if (dryRun) {
    console.log('Dry run completed asset collection.');
    return;
  }

  // 1. Create or Update the Flagship Course
  const course = await prisma.course.upsert({
    where: { slug: 'system-design' },
    update: {
      title: 'System Design: From Foundations to Internet-Scale Architecture',
      description: 'Master High-Level Design (HLD) and Low-Level Design (LLD) with real-world architectural blueprints, visual diagrams, and interview deep dives.',
      isPublished: true,
      order: 1,
    },
    create: {
      slug: 'system-design',
      title: 'System Design: From Foundations to Internet-Scale Architecture',
      description: 'Master High-Level Design (HLD) and Low-Level Design (LLD) with real-world architectural blueprints, visual diagrams, and interview deep dives.',
      isPublished: true,
      order: 1,
    },
  });
  console.log(`Created/Updated Course: ${course.title} (ID: ${course.id})`);

  // 2. Parts Definition
  const partsConfig = [
    { name: 'Introduction', slug: 'introduction', title: 'Part 1: Introduction & Foundations', order: 1 },
    { name: 'HLD', slug: 'hld', title: 'Part 2: High Level Design (HLD)', order: 2 },
    { name: 'LLD', slug: 'lld', title: 'Part 3: Low Level Design (LLD)', order: 3 },
  ];

  let totalModulesCount = 0;
  let totalTopicsCount = 0;
  let totalLessonsCount = 0;

  for (const partCfg of partsConfig) {
    const partDir = path.join(SOURCE_ROOT, partCfg.name);
    if (!fs.existsSync(partDir)) continue;

    const part = await prisma.part.upsert({
      where: {
        courseId_slug: { courseId: course.id, slug: partCfg.slug },
      },
      update: {
        title: partCfg.title,
        order: partCfg.order,
        isPublished: true,
      },
      create: {
        courseId: course.id,
        slug: partCfg.slug,
        title: partCfg.title,
        order: partCfg.order,
        isPublished: true,
      },
    });
    console.log(`\n=== PART: ${part.title} ===`);

    if (partCfg.name === 'Introduction') {
      // Introduction has direct topic folders
      const moduleSlug = 'system-design-basics';
      const module = await prisma.module.upsert({
        where: {
          partId_slug: { partId: part.id, slug: moduleSlug },
        },
        update: {
          title: 'System Design Fundamentals',
          courseId: course.id,
          order: 1,
          isPublished: true,
        },
        create: {
          courseId: course.id,
          partId: part.id,
          slug: moduleSlug,
          title: 'System Design Fundamentals',
          order: 1,
          isPublished: true,
        },
      });
      totalModulesCount++;

      const topicSlug = 'foundations';
      const topic = await prisma.topic.upsert({
        where: {
          moduleId_slug: { moduleId: module.id, slug: topicSlug },
        },
        update: {
          title: 'Core Concepts & Vocabulary',
          courseId: course.id,
          order: 1,
          isPublished: true,
        },
        create: {
          courseId: course.id,
          moduleId: module.id,
          slug: topicSlug,
          title: 'Core Concepts & Vocabulary',
          order: 1,
          isPublished: true,
        },
      });
      totalTopicsCount++;

      const lessonDirs = fs.readdirSync(partDir, { withFileTypes: true }).filter(d => d.isDirectory());
      let lessonOrder = 1;
      for (const lDir of lessonDirs) {
        const lessonPath = path.join(partDir, lDir.name);
        const mdFiles = fs.readdirSync(lessonPath).filter(f => f.endsWith('.md'));
        if (mdFiles.length === 0) continue;

        const mdFile = mdFiles[0];
        let content = fs.readFileSync(path.join(lessonPath, mdFile), 'utf-8');
        // Rewrite image links
        content = content.replace(/\(!?\[(.*?)\]\((.*?\.svg)\)/g, '(![$1](/course-assets/$2))');
        content = content.replace(/!\[(.*?)\]\((.*?\.svg)\)/g, '![$1](/course-assets/$2)');

        const { title } = extractTitle(content, lDir.name);
        const description = extractDescription(content);
        const lessonSlug = slugify(lDir.name);
        const readingTime = estimateReadingTime(content);
        const isFreePreview = lessonOrder === 1; // First lesson free

        const lesson = await prisma.lesson.upsert({
          where: {
            topicId_slug: { topicId: topic.id, slug: lessonSlug },
          },
          update: {
            title,
            description,
            content,
            courseId: course.id,
            moduleId: module.id,
            order: lessonOrder,
            isFreePreview,
            isPublished: true,
            readingTimeMinutes: readingTime,
          },
          create: {
            courseId: course.id,
            moduleId: module.id,
            topicId: topic.id,
            slug: lessonSlug,
            title,
            description,
            content,
            order: lessonOrder,
            isFreePreview,
            isPublished: true,
            readingTimeMinutes: readingTime,
          },
        });

        // Attach video metadata placeholder
        await prisma.videoMetadata.upsert({
          where: { lessonId: lesson.id },
          update: {},
          create: {
            lessonId: lesson.id,
            provider: 'YOUTUBE',
            videoUrl: 'https://www.youtube.com/watch?v=F2FmTdLtv_A',
            title: `${title} - Architectural Walkthrough`,
            durationSeconds: 780,
          },
        });

        lessonOrder++;
        totalLessonsCount++;
      }
      continue;
    }

    // For HLD and LLD parts:
    // Level 1: Module Directory (e.g., Consistency vs Availability)
    const moduleDirs = fs.readdirSync(partDir, { withFileTypes: true }).filter(d => d.isDirectory());
    let moduleOrder = 1;

    for (const mDir of moduleDirs) {
      const modulePath = path.join(partDir, mDir.name);
      const moduleSlug = slugify(mDir.name);
      const moduleTitle = mDir.name;

      const module = await prisma.module.upsert({
        where: {
          partId_slug: { partId: part.id, slug: moduleSlug },
        },
        update: {
          title: moduleTitle,
          courseId: course.id,
          order: moduleOrder,
          isPublished: true,
        },
        create: {
          courseId: course.id,
          partId: part.id,
          slug: moduleSlug,
          title: moduleTitle,
          order: moduleOrder,
          isPublished: true,
        },
      });
      totalModulesCount++;
      moduleOrder++;

      // Check if module itself has md files (e.g. overview)
      const topLevelMdInModule = fs.readdirSync(modulePath).filter(f => f.endsWith('.md'));
      
      // Level 2: Topic Directories (e.g., data-consistency-models)
      const topicDirs = fs.readdirSync(modulePath, { withFileTypes: true }).filter(d => d.isDirectory());
      let topicOrder = 1;
      let moduleLessonCounter = 1;

      for (const tDir of topicDirs) {
        const topicPath = path.join(modulePath, tDir.name);
        const topicSlug = slugify(tDir.name);
        const topicTitle = tDir.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Check if there is an overview md file directly in topicPath
        const topicMdFiles = fs.readdirSync(topicPath).filter(f => f.endsWith('.md'));
        let topicOverviewContent: string | null = null;
        if (topicMdFiles.length > 0) {
          topicOverviewContent = fs.readFileSync(path.join(topicPath, topicMdFiles[0]), 'utf-8');
        }

        const topic = await prisma.topic.upsert({
          where: {
            moduleId_slug: { moduleId: module.id, slug: topicSlug },
          },
          update: {
            title: topicTitle,
            courseId: course.id,
            order: topicOrder,
            overviewContent: topicOverviewContent,
            isPublished: true,
          },
          create: {
            courseId: course.id,
            moduleId: module.id,
            slug: topicSlug,
            title: topicTitle,
            order: topicOrder,
            overviewContent: topicOverviewContent,
            isPublished: true,
          },
        });
        totalTopicsCount++;
        topicOrder++;

        // Level 3: Subtopic / Lesson directories (e.g., strong-consistency)
        const lessonSubDirs = fs.readdirSync(topicPath, { withFileTypes: true }).filter(d => d.isDirectory());
        let lessonOrder = 1;

        // If there are subdirectories, each is a lesson
        if (lessonSubDirs.length > 0) {
          for (const lSubDir of lessonSubDirs) {
            const subDirPath = path.join(topicPath, lSubDir.name);
            const mdFiles = fs.readdirSync(subDirPath).filter(f => f.endsWith('.md'));
            if (mdFiles.length === 0) continue;

            let content = fs.readFileSync(path.join(subDirPath, mdFiles[0]), 'utf-8');
            content = content.replace(/!\[(.*?)\]\((.*?\.svg)\)/g, '![$1](/course-assets/$2)');

            const { title } = extractTitle(content, lSubDir.name);
            const description = extractDescription(content);
            const lessonSlug = slugify(lSubDir.name);
            const readingTime = estimateReadingTime(content);
            const isFreePreview = moduleLessonCounter === 1; // First lesson of each module is free

            const lesson = await prisma.lesson.upsert({
              where: {
                topicId_slug: { topicId: topic.id, slug: lessonSlug },
              },
              update: {
                title,
                description,
                content,
                courseId: course.id,
                moduleId: module.id,
                order: lessonOrder,
                isFreePreview,
                isPublished: true,
                readingTimeMinutes: readingTime,
              },
              create: {
                courseId: course.id,
                moduleId: module.id,
                topicId: topic.id,
                slug: lessonSlug,
                title,
                description,
                content,
                order: lessonOrder,
                isFreePreview,
                isPublished: true,
                readingTimeMinutes: readingTime,
              },
            });

            await prisma.videoMetadata.upsert({
              where: { lessonId: lesson.id },
              update: {},
              create: {
                lessonId: lesson.id,
                provider: 'YOUTUBE',
                videoUrl: 'https://www.youtube.com/watch?v=F2FmTdLtv_A',
                title: `${title} - Architectural Walkthrough`,
                durationSeconds: 840,
              },
            });

            lessonOrder++;
            moduleLessonCounter++;
            totalLessonsCount++;
          }
        } else if (topicMdFiles.length > 0) {
          // If no subdirs, the topic md file itself is the lesson!
          let content = topicOverviewContent || '';
          content = content.replace(/!\[(.*?)\]\((.*?\.svg)\)/g, '![$1](/course-assets/$2)');

          const { title } = extractTitle(content, tDir.name);
          const description = extractDescription(content);
          const lessonSlug = topicSlug;
          const readingTime = estimateReadingTime(content);
          const isFreePreview = moduleLessonCounter === 1;

          const lesson = await prisma.lesson.upsert({
            where: {
              topicId_slug: { topicId: topic.id, slug: lessonSlug },
            },
            update: {
              title,
              description,
              content,
              courseId: course.id,
              moduleId: module.id,
              order: 1,
              isFreePreview,
              isPublished: true,
              readingTimeMinutes: readingTime,
            },
            create: {
              courseId: course.id,
              moduleId: module.id,
              topicId: topic.id,
              slug: lessonSlug,
              title,
              description,
              content,
              order: 1,
              isFreePreview,
              isPublished: true,
              readingTimeMinutes: readingTime,
            },
          });

          await prisma.videoMetadata.upsert({
            where: { lessonId: lesson.id },
            update: {},
            create: {
              lessonId: lesson.id,
              provider: 'YOUTUBE',
              videoUrl: 'https://www.youtube.com/watch?v=F2FmTdLtv_A',
              title: `${title} - Architectural Walkthrough`,
              durationSeconds: 840,
            },
          });

          moduleLessonCounter++;
          totalLessonsCount++;
        }
      }
    }
  }

  console.log('\n========================================');
  console.log('✅ INGESTION COMPLETE');
  console.log(`Modules created: ${totalModulesCount}`);
  console.log(`Topics created:  ${totalTopicsCount}`);
  console.log(`Lessons created: ${totalLessonsCount}`);
  console.log('========================================\n');
}

if (require.main === module) {
  importCourseContent(false)
    .catch((e) => {
      console.error('Import failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
