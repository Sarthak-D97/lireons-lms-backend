import Link from 'next/link';
import { ArrowLeft, FileStack } from 'lucide-react';

export default async function GenericMaterialPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="page-shell container mx-auto px-4 py-14 max-w-3xl">
      <div className="surface-card p-7">
        <p className="chip mb-4">
          <FileStack className="w-3.5 h-3.5" /> Material Route
        </p>
        <h1 className="text-3xl font-bold mb-3">Material View</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4 leading-8">
          This page is reserved for non-video and non-article content types. You can extend it later for quizzes,
          downloadable resources, or custom learning assets.
        </p>
        <p className="text-sm text-slate-500 mb-7">Material ID: {params.id}</p>

        <Link href="/" className="btn-secondary px-4 py-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
