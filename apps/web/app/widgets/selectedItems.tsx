import { useBaseContext } from '@/app/contexts/base_context';
import { isNull } from '@/app/helpers/isNull';
import IconButton from '@/app/widgets/icon_button';
import { useRouter } from 'next/navigation';
import { FaEdit, FaEye, FaFileExport } from 'react-icons/fa';

// CSV Export Helper Function
const exportToCSV = (data: any[], filename: string = 'export.csv') => {
  if (data.length === 0) return;

  // Extract headers from first object
  const headers = Object.keys(data[0]);

  // Convert data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map((obj) =>
      headers
        .map(
          (header) =>
            // Escape commas and quotes in cell values
            `"${String(obj[header]).replace(/"/g, '""')}"`,
        )
        .join(','),
    ),
  ];

  // Create and download CSV
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // TypeScript-safe download method
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const SelectedAction: React.FC<any> = ({
  id,
  data,
  base,
  siteInfo,
  user,
}: {
  data: any[];
  base: string;
  siteInfo: BrandType;
  user: UserTypes;
  id?: string;
}) => {
  const router = useRouter();
  const { addRouteData } = useBaseContext();

  const item = data;

  if (isNull(item)) {
    return;
  }

  return (
    <div className="flex flex-col pt-2 border-t border-gray-200 px-2">
      <div className="flex items-center justify-between">
        <span>
          {data.length} item{data.length > 1 ? 's' : ''} selected
        </span>
        <IconButton
          size="xs"
          icon={<FaFileExport />}
          color="auto"
          onClick={() => exportToCSV(data, `${base}_export.csv`)}
          //className="flex items-center gap-2 px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Export
        </IconButton>
      </div>
    </div>
  );
};

export default SelectedAction;
