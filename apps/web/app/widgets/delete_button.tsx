import { FaTrash, FaXmark } from 'react-icons/fa6';
import { RaisedButton } from '@/app/widgets/raised_button';
import { modHeaders } from '@/app/helpers/modHeaders';
import { api_delete } from '@/app/src/constants';
import { useState } from 'react';

interface DeleteButtonProps {
  deleteData: any;
  onDelete: (success: boolean) => void;
  url: string;
  text?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ deleteData, onDelete, url, text }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState('Are you sure you want to delete this?');

  const handleDelete = async (deleteData: any, url: string) => {
    let success = false;

    try {
      if (Array.isArray(deleteData)) {
        for (const row of deleteData) {
          const delUrl = await api_delete({
            id: row.ID,
            endpoint: url,
            subBase: 'none',
            userId: '',
          });

          const response = await fetch(delUrl, {
            method: 'GET',
            headers: await modHeaders(),
          });

          const res = await response.json();
          if (res.success) {
            success = true;
          }
        }
      } else {
        const delUrl = await api_delete({
          id: deleteData,
          endpoint: url,
          subBase: 'none',
          userId: '',
        });
        const response = await fetch(delUrl, {
          method: 'GET',
          headers: await modHeaders(),
        });

        const res = await response.json();
        if (res.success) {
          success = true;
        }
      }
    } catch (error) {
      success = false;
    }

    onDelete(success);
    setShowModal(false);
  };

  return (
    <div className="flex items-center">
      {text && <span className="mr-2 text-gray-700 font-normal text-sm">{text}</span>}

      <RaisedButton
        size="sm"
        color="danger"
        icon={<FaTrash />}
        iconPosition="before"
        onClick={() => setShowModal(true)}
      >
        Delete
      </RaisedButton>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg m-5">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">{deleteInfo}</p>
            <div className="flex justify-end">
              <RaisedButton
                size="sm"
                color="primary"
                icon={<FaXmark />}
                iconPosition="before"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </RaisedButton>

              <RaisedButton
                size="sm"
                color="danger"
                icon={<FaXmark />}
                iconPosition="before"
                onClick={() => handleDelete(deleteData, url)}
              >
                Delete
              </RaisedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
