import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { LessonEditorForm } from "@/components/admin/LessonEditorForm";
import { prisma } from "@/lib/prisma";

interface EditPageProps {
  params: {
    lessonId: string;
  };
}

export const metadata: Metadata = {
  title: "Edit Lesson | CODEXA.io Admin",
};

export default async function EditLessonPage({ params }: EditPageProps) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: {
        include: {
          part: true,
        },
      },
      videoMetadata: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LessonEditorForm
          lesson={{
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            isPublished: lesson.isPublished,
            isFreePreview: lesson.isFreePreview,
            videoUrl: lesson.videoMetadata?.videoUrl || null,
            moduleTitle: lesson.module.title,
            partTitle: lesson.module.part.title,
          }}
        />
      </main>
    </div>
  );
}
