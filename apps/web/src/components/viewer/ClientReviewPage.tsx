import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FloorPlanSvg } from './FloorPlanSvg';
import { api } from '../../lib/api';
import type { HouseDesign } from '@aihome/domain';

export function ClientReviewPage() {
  const { versionId } = useParams();

  const [design, setDesign] = useState<HouseDesign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!versionId) {
      setError("Invalid share link");
      setIsLoading(false);
      return;
    }

    // Call the MVP endpoint
    api.get(`/projects/draft/${versionId}`)
    .then(res => {
      // The backend returns the designData directly
      setDesign(res.data as HouseDesign);
    })
    .catch(err => {
      setError(err.response?.data?.message || "Failed to load shared design");
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [versionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-500 animate-pulse">Loading Client Review...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow border border-red-200 max-w-md w-full text-center">
          <div className="text-red-500 font-bold text-xl mb-2">Access Denied</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AiHome</h1>
          <p className="text-sm text-gray-500">Client Review Presentation</p>
        </div>
        <div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition">
            Approve Design
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Floor Plan Concept</h2>
          
          {/* We reuse the FloorPlanSvg but ideally pass a readOnly flag */}
          <div className="pointer-events-none">
            <FloorPlanSvg design={design} />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Client Feedback</h3>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Leave comments or request changes for your architect here..."
            />
            <button className="mt-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50">
              Submit Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
